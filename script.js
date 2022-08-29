'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
let currentUser;
const minDepPercent = 10;
let sortEnabled = false;

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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (movement, index) {
    const movementType = movement >= 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">

    <div class="movements__type movements__type--${movementType}">${
      index + 1
    } ${movementType}</div>
    <div class="movements__value">${movement} EUR</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (currentUser) {
  currentUser.balance = currentUser.movements.reduce(
    (acc, mov) => acc + mov,
    0
  );
  labelBalance.textContent = `${currentUser.balance} EUR`;
};

const calcDisplaySummary = function (currentUser) {
  const incomes = currentUser.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes} EUR`;

  const outgoing = currentUser.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outgoing)} EUR`;

  const interest = currentUser.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * currentUser.interestRate) / 100)
    .filter(deposit => deposit > 1)
    .reduce((acc, intrst) => acc + intrst, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)} EUR`;
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
  // Add a withdrawal transaction to the current logged in user account's movements array
  currentUser.movements.push(-Math.abs(transferAmount));

  // Add a deposit transaction to the desintaion account's movements array
  destUser.movements.push(transferAmount);

  // Call display account information function of source account user
  displayAccountInfo(currentUser);
};

const displayAccountInfo = function (currentUser, sortMovs = false) {
  displayMovements(currentUser.movements, sortMovs);
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
    currentUser.movements.push(loanAmount);
    displayAccountInfo(currentUser);
  }
};

const closeAccount = function (username, pin) {
  // Validate the credentials and remove the account
  if (currentUser.username === username && currentUser.pin === pin) {
    const indexOfAccount = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(indexOfAccount, 1);

    // Logout
    logout();
  }
};

const logout = function () {
  containerMovements.innerHTML = '';
  labelBalance.textContent =
    labelSumIn.textContent =
    labelSumOut.textContent =
    labelSumInterest.textContent =
      0;
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
  const transferAmount = Number(inputTransferAmount.value);

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

  const loanAmount = Number(inputLoanAmount.value);
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
  displayMovements(currentUser.movements, !sortEnabled);
  sortEnabled = !sortEnabled;
});

// Logout event handler
btnLogout.addEventListener('click', function (e) {
  // Prevent form from submitting and causing reload.
  e.preventDefault();
  logout();
});
