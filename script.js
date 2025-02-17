document.addEventListener('DOMContentLoaded', function() {
    const savedUserId = localStorage.getItem('savedUserId');
    if (savedUserId) {
        loginUser(savedUserId);
    }

    // Check if the data needs to be refreshed every 24 hours
    checkAndAutoRefresh();
});

function register() {
    const userId = document.getElementById('userIdInput').value;
    const password = document.getElementById('passwordInput').value;

    if (userId && password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (!users[userId]) {
            users[userId] = password;
            localStorage.setItem('users', JSON.stringify(users));
            alert("Registration successful!");
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
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userId').value = userId;
    loadUserData(userId);
}

// Automatically refresh interest data once a day
function checkAndAutoRefresh() {
    const userId = document.getElementById('userId')?.value;
    if (userId) {
        // Get the last refresh date from localStorage
        const lastRefreshDate = localStorage.getItem('lastRefreshDate');
        const currentDate = new Date().toLocaleDateString();

        if (lastRefreshDate !== currentDate) {
            // Update the data and store the current date
            refreshInterest();
            localStorage.setItem('lastRefreshDate', currentDate);
        }
    }

    // Set an interval to check for daily refresh
    setInterval(() => {
        const userId = document.getElementById('userId')?.value;
        if (userId) {
            const lastRefreshDate = localStorage.getItem('lastRefreshDate');
            const currentDate = new Date().toLocaleDateString();

            if (lastRefreshDate !== currentDate) {
                // Update the data and store the current date
                refreshInterest();
                localStorage.setItem('lastRefreshDate', currentDate);
            }
        }
    }, 86400000); // 24 hours in milliseconds (1000 * 60 * 60 * 24)
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
            totalInterest: totalInterest,
            notificationStatus: 'off' // Default notification state
        };

        const editingInvestorName = document.getElementById('investorForm').getAttribute('data-investor-name');
        if (editingInvestorName) {
            updateInvestor(userId, editingInvestorName, investor);
        } else {
            saveToLocalStorage(userId, investor);
            displayInvestor(investor);
        }
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
    investorDiv.setAttribute('data-investor-name', investor.name);
    investorDiv.innerHTML = `
        <h3 class="investor-name">${investor.name}</h3>
        <div>
            <p class="interest-earned">Interest Earned: ₹${investor.totalInterest}</p>
            <button onclick="editInvestor(this)">Edit</button>
            <button onclick="deleteInvestor(this)">Delete</button>
            <button onclick="toggleNotification(this)" class="notification-bell ${investor.notificationStatus}">🔔</button>
        </div>
    `;
    investorsDiv.appendChild(investorDiv);
}

function toggleNotification(button) {
    const investorName = button.closest('.investor').getAttribute('data-investor-name');
    const userId = document.getElementById('userId').value;

    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    const investor = investors.find(inv => inv.name === investorName);

    if (investor) {
        investor.notificationStatus = investor.notificationStatus === 'off' ? 'on' : 'off';
        localStorage.setItem(userId, JSON.stringify(investors));

        button.classList.toggle('on');
        button.classList.toggle('off');
        
        showNotificationPopup(investor.notificationStatus);
    }
}

function showNotificationPopup(status) {
    const message = status === 'on' ? "Notifications Enabled" : "Notifications Disabled";
    alert(message);
}

function editInvestor(button) {
    const investorDiv = button.closest('.investor');
    const investorName = investorDiv.getAttribute('data-investor-name');
    const userId = document.getElementById('userId').value;

    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    const investor = investors.find(inv => inv.name === investorName);

    if (investor) {
        document.getElementById('name').value = investor.name;
        document.getElementById('amount').value = investor.amount;
        document.getElementById('date').value = investor.date;
        document.getElementById('rate').value = investor.rate;
        document.getElementById('totalInterest').value = investor.totalInterest;

        document.getElementById('investorForm').classList.remove('hidden');
        document.getElementById('investorForm').setAttribute('data-investor-name', investorName);
    }
}

function updateInvestor(userId, investorName, updatedInvestor) {
    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    const investorIndex = investors.findIndex(inv => inv.name === investorName);

    if (investorIndex !== -1) {
        investors[investorIndex] = updatedInvestor;
        localStorage.setItem(userId, JSON.stringify(investors));
        loadUserData(userId);
    }
}

function deleteInvestor(button) {
    const investorName = button.closest('.investor').getAttribute('data-investor-name');
    const userId = document.getElementById('userId').value;

    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    investors = investors.filter(inv => inv.name !== investorName);
    localStorage.setItem(userId, JSON.stringify(investors));

    loadUserData(userId); // Reload user data after deletion
}

function loadUserData(userId) {
    const investors = JSON.parse(localStorage.getItem(userId)) || [];
    document.getElementById('investors').innerHTML = '';
    investors.forEach(investor => displayInvestor(investor));
}

function saveToLocalStorage(userId, investor) {
    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    investors.push(investor);
    localStorage.setItem(userId, JSON.stringify(investors));
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('rate').value = '';
    document.getElementById('totalInterest').value = '';
}

// Refresh interest for all investors
function refreshInterest() {
    const userId = document.getElementById('userId').value;
    let investors = JSON.parse(localStorage.getItem(userId)) || [];
    
    investors.forEach(investor => {
        const updatedInterest = calculateInterest(investor.amount, investor.rate);
        investor.totalInterest = updatedInterest;
    });

    localStorage.setItem(userId, JSON.stringify(investors));

    loadUserData(userId);
}
