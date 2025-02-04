document.addEventListener('DOMContentLoaded', function() {
    const savedUserId = localStorage.getItem('savedUserId');
    if (savedUserId) {
        loginUser(savedUserId);
    }
});

function showRegisterForm() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('registerContainer').classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('registerContainer').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
}

function register() {
    const userId = document.getElementById('registerUserId').value;
    const password = document.getElementById('registerPassword').value;

    if (userId && password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (!users[userId]) {
            users[userId] = password;
            localStorage.setItem('users', JSON.stringify(users));
            alert("Registration successful!");
            showLoginForm();
        } else {
            alert("User ID already exists. Please choose a different User ID.");
        }
    } else {
        alert("Please enter both User ID and Password.");
    }
}

function login() {
    const userId = document.getElementById('userIdInput').value;
    const password = document.getElementById('passwordInput').value;

    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[userId] === password) {
        localStorage.setItem('savedUserId', userId);
        loginUser(userId);
    } else {
        alert("Invalid User ID or Password.");
    }
}

function logout() {
    localStorage.removeItem('savedUserId');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
}

function loginUser(userId) {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('registerContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userId').value = userId;
    loadUserData(userId);
}

function showForm() {
    document.getElementById('investorForm').classList.remove('hidden');
    clearForm();
}

function hideForm() {
    document.getElementById('investorForm').classList.add('hidden');
}

function saveInvestor() {
    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const rate = document.getElementById('rate').value;
    const userId = document.getElementById('userId').value;

    if (name && amount && date && rate && userId) {
        const totalInterest = calculateInterest(amount, rate);
        const investor = {
            name: name,
            amount: amount,
            date: date,
            rate: rate,
            totalInterest: totalInterest
        };
        saveToLocalStorage(userId, investor);
        displayInvestor(investor);
        hideForm();
    } else {
        alert("Please fill in all fields.");
    }
}

function calculateInterest(amount, rate) {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDate = new Date().getDate();
    const dailyRate = rate / daysInMonth / 100;
    return (amount * dailyRate * currentDate).toFixed(2);
}

function displayInvestor(investor) {
    const investorsDiv = document.getElementById('investors');
    const investorDiv = document.createElement('div');
    investorDiv.className = 'investor';
    investorDiv.innerHTML = `
        <h3 class="investor-name">${investor.name}</h3>
        <div>
            <p class="interest-earned">Interest Earned: ₹${investor.totalInterest}</p>
            <button onclick="toggleForm(this)">Edit</button>
            <button onclick="deleteInvestor(this)">Delete</button>
            <button onclick="toggleNotification(this)" class="notification-bell off">🔔</button>
        </div>
        <div class="form hidden">
            <input type="text" value="${investor.name}" placeholder="Investor's Name" class="name-input">
            <input type="number" value="${investor.amount}" placeholder="Invested Amount" class="amount-input">
            <input type="date" value="${investor.date}" placeholder="Date of Investment">
            <input type="number" step="0.01" value="${investor.rate}" placeholder="Monthly Interest Rate (%)" class="rate-input">
            <input type="text" value="${investor.totalInterest}" placeholder="Total Interest Earned" readonly class="interest-input">
            <button onclick="saveChanges(this)">Save Changes</button>
        </div>
    `;

    investorsDiv.appendChild(investorDiv);

    const amountInput = investorDiv.querySelector('.amount-input');
    const rateInput = investorDiv.querySelector('.rate-input');

    amountInput.addEventListener('input', () => updateInterest(amountInput, rateInput, investorDiv));
    rateInput.addEventListener('input', () => updateInterest(amountInput, rateInput, investorDiv));
}

function updateInterest(amountInput, rateInput, investorDiv) {
    const amount = amountInput.value;
    const rate = rateInput.value;

    if (amount && rate) {
        const totalInterest = calculateInterest(amount, rate);
        const interestInput = investorDiv.querySelector('.interest-input');
        interestInput.value = totalInterest;
        investorDiv.querySelector('.interest-earned').innerText = `Interest Earned: ₹${totalInterest}`;
    }
}

function deleteInvestor(button) {
    const userId = document.getElementById('userId').value;
    const name = button.parentElement.parentElement.querySelector('.investor-name').innerText;
    removeFromLocalStorage(userId, name);
    button.parentElement.parentElement.remove();
}

function toggleForm(button) {
    const form = button.parentElement.nextElementSibling;
    form.classList.toggle('hidden');
}

function saveChanges(button) {
    const form = button.parentElement;
    const name = form.querySelector('.name-input').value;
    const amount = form.querySelector('.amount-input').value;
    const date = form.querySelector('input[type="date"]').value;
    const rate = form.querySelector('.rate-input').value;

    const totalInterest = calculateInterest(amount, rate);

    const investorDiv = form.parentElement;

    investorDiv.querySelector('.investor-name').innerText = name;
    investorDiv.querySelector('.interest-earned').innerText = `Interest Earned: ₹${totalInterest}`;

    form.classList.add('hidden'); // Hide the form after saving changes
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('rate').value = '';
    document.getElementById('totalInterest').value = '';
}

function toggleNotification(button) {
    button.classList.toggle('on');
    button.classList.toggle('off');
    if (button.classList.contains('on')) {
        button.innerText = '🔔 On';
        alert('Notifications enabled for this investor.');
    } else {
        button.innerText = '🔔 Off';
        alert('Notifications disabled for this investor.');
    }
}

function saveToLocalStorage(userId, investor) {
    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    investors.push(investor);
    localStorage.setItem(userId, JSON.stringify(investors));
}

function loadUserData(userId) {
    const investors = JSON.parse(localStorage.getItem(userId)) || [];
    document.getElementById('investors').innerHTML = '';
    investors.forEach(investor => displayInvestor(investor));
}

function removeFromLocalStorage(userId, name) {
    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    investors = investors.filter(investor => investor.name !== name);
    localStorage.setItem(userId, JSON.stringify(investors));
}

// Notify on the last day of the month
const today = new Date();
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
if (today.getDate() === lastDay) {
    alert("Reminder: Please pay the interest earned to your investors.");
}
