let users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function login() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.userId === userId && u.password === password);

    if (user) {
        loggedInUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        updateClientTable();
        updateClientDropdown();
    } else {
        alert('Invalid credentials');
    }
}

function register() {
    const newUserId = document.getElementById('newUserId').value;
    const newPassword = document.getElementById('newPassword').value;

    if (newUserId && newPassword) {
        users.push({ userId: newUserId, password: newPassword });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please log in.');
        showLogin();
    } else {
        alert('Please fill in all fields.');
    }
}

function logout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

if (loggedInUser) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    updateClientTable();
    updateClientDropdown();
} else {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function toggleForm(formId) {
    document.getElementById('investmentCalculator').style.display = 'none';
    document.getElementById('totalPaidTracker').style.display = 'none';
    document.getElementById(formId).style.display = 'block';
}

function addClient() {
    const clientName = document.getElementById('clientName').value;
    const investmentAmount = parseFloat(document.getElementById('investmentAmount').value);
    const returnRate = parseFloat(document.getElementById('returnRate').value);
    const brokerCutRate = parseFloat(document.getElementById('brokerCutRate').value);
    const startDate = document.getElementById('startDate').value;

    const monthlyReturn = (investmentAmount * returnRate) / 100;
    const brokerCut = (investmentAmount * brokerCutRate) / 100;
    const paidToClient = monthlyReturn - brokerCut;
    const paidToClientAndBroker = monthlyReturn;

    clients.push({
        clientName,
        investmentAmount,
        returnRate,
        brokerCutRate,
        startDate,
        monthlyReturn,
        brokerCut,
        paidToClient,
        paidToClientAndBroker
    });

    localStorage.setItem('clients', JSON.stringify(clients));

    updateClientTable();
    updateClientDropdown();
}

function updateClientTable() {
    const tableBody = document.getElementById('clientData');
    tableBody.innerHTML = '';

    clients.forEach((client, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.clientName}</td>
            <td>${client.investmentAmount}</td>
            <td>${client.returnRate}</td>
            <td>${client.brokerCutRate}</td>
            <td>${client.startDate}</td>
            <td>${client.monthlyReturn}</td>
            <td>${client.brokerCut}</td>
            <td>${client.paidToClient}</td>
            <td>${client.paidToClientAndBroker}</td>
            <td><span class="delete-btn" onclick="deleteClient(${index})">Delete</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteClient(index) {
    clients.splice(index, 1);
    localStorage.setItem('clients', JSON.stringify(clients));

    updateClientTable();
    updateClientDropdown();
}

function updateClientDropdown() {
    const clientDropdown = document.getElementById('clientTrackerName');
    clientDropdown.innerHTML = '';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.clientName;
        option.textContent = client.clientName;
        clientDropdown.appendChild(option);
    });
}

function updatePaymentsForClient() {
    const clientName = document.getElementById('clientTrackerName').value;

    if (clientName) {
        const clientPayments = payments.filter(payment => payment.clientName === clientName);
        const tableBody = document.getElementById('paymentRecords').querySelector('tbody');
        tableBody.innerHTML = '';

        clientPayments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.paymentDate}</td>
                <td>${payment.paymentAmount}</td>
                <td>${payment.brokerCut}</td>
                <td>${payment.paidToClient}</td>
            `;
            tableBody.appendChild(row);
        });

        updateTotalSummary(clientPayments);
    }
}

function addPayment() {
    const clientName = document.getElementById('clientTrackerName').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);

    const client = clients.find(c => c.clientName === clientName);

    if (client) {
        // Broker cut is now calculated based on the Investment Amount
        const brokerCut = (client.investmentAmount * client.brokerCutRate) / 100;
        const paidToClient = paymentAmount - brokerCut;

        payments.push({
            clientName,
            paymentDate,
            paymentAmount,
            brokerCut,
            paidToClient
        });

        localStorage.setItem('payments', JSON.stringify(payments));

        updatePaymentsForClient();
    } else {
        alert('Client not found.');
    }
}

function updateTotalSummary(clientPayments) {
    const totalAmountPaid = clientPayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
    const totalAmountPaidBroker = clientPayments.reduce((sum, payment) => sum + payment.brokerCut, 0);
    const totalAmountPaidClient = clientPayments.reduce((sum, payment) => sum + payment.paidToClient, 0);

    document.getElementById('totalAmountPaid').textContent = totalAmountPaid.toFixed(2);
    document.getElementById('totalAmountPaidBroker').textContent = totalAmountPaidBroker.toFixed(2);
    document.getElementById('totalAmountPaidClient').textContent = totalAmountPaidClient.toFixed(2);
}
