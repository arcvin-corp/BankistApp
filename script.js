'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data 01
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// Data 02

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-08-25T23:36:17.929Z',
    '2022-08-29T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

let currentUser;
const minDepPercent = 10;
let sortEnabled = false;
const globalTimeout = 1 * 60 * 1000;
let futureTime;
let timerSet = false;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const loginform = document.querySelector('.login');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const btnLogout = document.querySelector('.logout__btn');

const formatMovementDate = function (locale, timeStamp) {
  const daysPassed = calcDaysPassed(new Date(), new Date(timeStamp));

  if (daysPassed === 0) {
    return 'Today';
  } else if (daysPassed === 1) {
    return 'Yesterday';
  } else if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  } else {
    return getShortDate(locale, timeStamp);
  }
};

const getShortDate = function (locale, timeStamp) {
  return new Intl.DateTimeFormat(locale).format(new Date(timeStamp));
};

const calcDaysPassed = (date1, date2) => {
  // Checking if the date values are Number and converting them if not
  date1 = Number.isFinite(date1) ? date1 : +date1;
  date2 = Number.isFinite(date2) ? date2 : +date2;

  const daysPassed = Math.floor(
    Math.abs((date1 - date2) / (1000 * 60 * 60 * 24))
  );

  return daysPassed;
};

const buildDatesToMovsMaps = function (account) {
  const DatesToMovsMap = new Map();

  account.movementsDates.forEach((timeStamp, idx) => {
    DatesToMovsMap.set(timeStamp, account.movements[idx]);
  });

  return DatesToMovsMap;
};

const displayMovements = function (currentUser, sort = false) {
  containerMovements.innerHTML = '';

  let DatesToMovsMap = buildDatesToMovsMaps(currentUser);

  if (sort) {
    DatesToMovsMap = new Map(
      [...DatesToMovsMap.entries()].sort((a, b) => a[1] - b[1])
    );
  }

  let index = 1;

  DatesToMovsMap.forEach(function (movement, timeStamp) {
    const movementType = movement >= 0 ? 'deposit' : 'withdrawal';

    const moveOpts = {
      style: 'currency',
      currency: currentUser.currency,
    };

    const moveValue = new Intl.NumberFormat(
      currentUser.locale,
      moveOpts
    ).format(Number(movement.toFixed(2)));

    const html = `<div class="movements__row" style="background-color: ${
      index % 2 === 0 ? '#f1f1f1' : '#fff'
    }">

    <div class="movements__type movements__type--${movementType}">${index} ${movementType}</div>
    <div class="movements__date">${formatMovementDate(
      currentUser.locale,
      timeStamp
    )}</div>
    <div class="movements__value">${moveValue}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    index++;
  });
};

const calcDisplayBalance = function (currentUser) {
  currentUser.balance = currentUser.movements.reduce(
    (acc, mov) => acc + mov,
    0
  );
  labelDate.textContent = getShortDate(currentUser.locale, Date.now());

  const balanceOpts = {
    style: 'currency',
    currency: currentUser.currency,
  };

  const balance = new Intl.NumberFormat(currentUser.locale, balanceOpts).format(
    Number(currentUser.balance.toFixed(2))
  );

  labelBalance.textContent = balance;
};

const calcDisplaySummary = function (currentUser) {
  const currOpts = {
    style: 'currency',
    currency: currentUser.currency,
  };

  const incomes = currentUser.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const sumInValue = new Intl.NumberFormat(currentUser.locale, currOpts).format(
    Number(incomes.toFixed(2))
  );
  labelSumIn.textContent = sumInValue;

  const outgoing = currentUser.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const outgoingValue = new Intl.NumberFormat(
    currentUser.locale,
    currOpts
  ).format(Number(outgoing.toFixed(2)));
  labelSumOut.textContent = outgoingValue;

  const interest = currentUser.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * currentUser.interestRate) / 100)
    .filter(deposit => deposit > 1)
    .reduce((acc, intrst) => acc + intrst, 0);
  const interestValue = new Intl.NumberFormat(
    currentUser.locale,
    currOpts
  ).format(Number(interest.toFixed(2)));
  labelSumInterest.textContent = interestValue;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(n => n[0])
      .join('');
  });
};

createUsernames(accounts);

const handleTransfer = function (destUser, transferAmount) {
  // Reset the logout timer
  timerSet = false;

  // Add a withdrawal transaction to the current logged in user account's movements array with the timestamp to movementDates array
  const transactionDate = new Date(Date.now()).toISOString();
  currentUser.movements.push(-Math.abs(transferAmount));
  currentUser.movementsDates.push(transactionDate);

  // Add a deposit transaction to the recipient account's movements array with the timestamp to movementDates array
  destUser.movements.push(transferAmount);
  destUser.movementsDates.push(transactionDate);

  // Call display account information function of source account user
  displayAccountInfo(currentUser);
};

const displayAccountInfo = function (currentUser, sortMovs = false) {
  displayMovements(currentUser, sortMovs);
  calcDisplayBalance(currentUser);
  calcDisplaySummary(currentUser);
};

const login = function (username, pin) {
  // Find the user account
  currentUser = accounts.find(acc => acc.username === username);

  if (currentUser?.pin === pin) {
    // Clear the login field input values
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // To remove focus from PIN input field.

    // Hide the user credentials input fields and enable logout button
    loginform.style.display = 'none';
    btnLogout.style.display = 'block';

    // Display welcome message
    labelWelcome.textContent = `Good Day, ${currentUser.owner.split(' ')[0]}!`;

    // Call display account information function
    displayAccountInfo(currentUser);

    // Unhide and show the app container
    containerApp.style.opacity = 100;

    // Start login timeout
    console.log('Login session timeout started');
    const startLogOutTime = setInterval(() => {
      // Call the time current time every second
      let timeNow = Date.now();

      // Set the future time for the first time only
      if (!timerSet) {
        futureTime = globalTimeout + timeNow;
        timerSet = true;
      }

      let remainingTime = futureTime - timeNow;
      if (remainingTime > 0) {
        // Log the remaining time to the UI
        let remainingMinutes = Math.floor(remainingTime / 1000 / 60);
        let remainingSeconds = Math.floor((remainingTime / 1000) % 60);
        labelTimer.textContent = `${String(remainingMinutes).padStart(
          2,
          0
        )}:${String(remainingSeconds).padStart(2, 0)}`;
      } else {
        logout();
        console.log('Application has logged out!');
        clearInterval(startLogOutTime);
      }
    }, 1000);
  } else {
    console.log('Invalid User');
  }
};

const requestLoan = function (loanAmount) {
  // Bank has a rule that a loan can only be requested if at least one deposit is greater than 10% of the loan amount requested
  const requiredDepAmount = (loanAmount * minDepPercent) / 100;

  const isApproved = currentUser.movements
    .filter(mov => mov > 0)
    .some(mov => mov >= requiredDepAmount);
  console.log(isApproved);

  if (isApproved) {
    // Reset the logout timeout
    timerSet = false;
    // Add a deposit transaction to the current logged in user account's movements array with the timestamp to movementDates array
    setTimeout(() => {
      const transactionDate = new Date(Date.now()).toISOString();
      currentUser.movements.push(loanAmount);
      currentUser.movementsDates.push(transactionDate);
      displayAccountInfo(currentUser);
    }, 3000);
  }
};

const closeAccount = function (username, pin) {
  // Validate the credentials and remove the account
  if (currentUser.username === username && currentUser.pin === pin) {
    const indexOfAccount = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(indexOfAccount, 1);

    // Reset the logout timer
    timerSet = false;

    // Logout
    logout();
  }
};

const logout = function () {
  timerSet = false;
  console.log(futureTime);
  containerMovements.innerHTML = '';
  labelBalance.textContent =
    labelSumIn.textContent =
    labelSumOut.textContent =
    labelSumInterest.textContent =
      0;
  inputLoanAmount.value = '';
  inputTransferAmount.value = inputTransferTo.value = '';
  inputCloseUsername.value = inputClosePin.value = '';
  containerApp.style.opacity = 0;
  labelWelcome.textContent = 'Log in to get started';
  currentUser = undefined;
  loginform.style.display = 'block';
  btnLogout.style.display = 'none';
};

/* Event handlers */

// Login event handler
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);
  login(username, pin);
});

// Transfer event handler
btnTransfer.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();

  const username = inputTransferTo.value;
  const transferAmount = Math.floor(inputTransferAmount.value);

  // Find the destination user account
  const destUser = accounts.find(acc => acc.username === username);

  // Perform transfer
  if (
    destUser &&
    transferAmount > 0 &&
    transferAmount < currentUser.balance &&
    currentUser.username !== username
  ) {
    handleTransfer(destUser, transferAmount);
  }

  // Clear the input fields
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

// Request loan event handler
btnLoan.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  if (loanAmount > 0) {
    requestLoan(loanAmount);
  }

  // Clear the input fields
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Close Account event handler
btnClose.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();

  const username = inputCloseUsername.value.trim();
  const pin = Number(inputClosePin.value.trim());

  if (username && pin) {
    closeAccount(username, pin);

    // Clear the input fields
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
  }
});

// Sort event handler
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentUser, !sortEnabled);
  sortEnabled = !sortEnabled;
});

// Logout event handler
btnLogout.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();
  logout();
});
