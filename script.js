// Arrays to store client and payment data
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];

// Login/Register Functionality
let loggedIn = false;

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

function register() {
  const newUserId = document.getElementById("newUserId").value;
  const newPassword = document.getElementById("newPassword").value;

  if (newUserId && newPassword) {
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('password', newPassword);
    alert('Registered successfully! Please login.');
    showLogin();
  } else {
    alert("Please fill in all fields.");
  }
}

function login() {
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;

  const storedUserId = localStorage.getItem('userId');
  const storedPassword = localStorage.getItem('password');

  if (userId === storedUserId && password === storedPassword) {
    loggedIn = true;
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("logoutButton").style.display = "block";
  } else {
    alert("Invalid credentials, please try again.");
  }
}

function logout() {
  loggedIn = false;
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("logoutButton").style.display = "none";
}

// Toggle forms
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Add client function
function addClient() {
  const clientName = document.getElementById('clientName').value;
  const investmentAmount = document.getElementById('investmentAmount').value;
  const returnRate = document.getElementById('returnRate').value;
  const brokerCutRate = document.getElementById('brokerCutRate').value;
  const startDate = document.getElementById('startDate').value;

  if (!clientName || !investmentAmount || !returnRate || !brokerCutRate || !startDate) {
    alert('Please fill in all fields.');
    return;
  }

  const client = {
    name: clientName,
    amount: parseFloat(investmentAmount),
    returnRate: parseFloat(returnRate),
    brokerCutRate: parseFloat(brokerCutRate),
    startDate: startDate
  };

  clients.push(client);
  localStorage.setItem('clients', JSON.stringify(clients)); // Save to localStorage
  updateClientDropdown();
  displayClientData();

  document.getElementById('clientName').value = '';
  document.getElementById('investmentAmount').value = '';
  document.getElementById('returnRate').value = '';
  document.getElementById('brokerCutRate').value = '';
  document.getElementById('startDate').value = '';
}

// Update the client dropdown with names
function updateClientDropdown() {
  const dropdown = document.getElementById('clientTrackerName');
  dropdown.innerHTML = ''; // Clear previous options
  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.name;
    option.textContent = client.name;
    dropdown.appendChild(option);
  });
}

// Display client data in table
function displayClientData() {
  const clientDataTable = document.getElementById('clientData');
  clientDataTable.innerHTML = ''; // Clear previous data

  clients.forEach((client, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.amount}</td>
      <td>${client.returnRate}%</td>
      <td>${client.brokerCutRate}%</td>
      <td>${formatDate(client.startDate)}</td>
      <td>${(client.amount * client.returnRate / 100).toFixed(2)}</td>
      <td>${(client.amount * client.brokerCutRate / 100).toFixed(2)}</td>
      <td>${(client.amount * client.returnRate / 100).toFixed(2)}</td>
      <td>${(client.amount * client.returnRate / 100 + client.amount * client.brokerCutRate / 100).toFixed(2)}</td>
      <td><span class="delete-btn" onclick="deleteClient(${index})">🗑️</span></td>
    `;
    clientDataTable.appendChild(row);
  });
}

// Format date to D-M-Y
function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

// Delete client function
function deleteClient(index) {
  if (confirm("Are you sure you want to delete this client?")) {
    clients.splice(index, 1);
    localStorage.setItem('clients', JSON.stringify(clients)); // Save to localStorage
    displayClientData();
  }
}

// Add payment function
function addPayment() {
  const clientName = document.getElementById('clientTrackerName').value;
  const paymentDate = document.getElementById('paymentDate').value;
  const paymentAmount = document.getElementById('paymentAmount').value;

  if (!clientName || !paymentDate || !paymentAmount) {
    alert('Please fill in all fields.');
    return;
  }

  const client = clients.find(client => client.name === clientName);
  if (!client) {
    alert('Client not found.');
    return;
  }

  const brokerAmount = (client.amount * client.brokerCutRate) / 100;
  const clientPaid = paymentAmount - brokerAmount;

  const paymentRecord = {
    clientName: clientName,
    paymentDate: paymentDate,
    paymentAmount: parseFloat(paymentAmount),
    brokerAmount: brokerAmount,
    clientPaid: clientPaid
  };

  payments.push(paymentRecord);
  localStorage.setItem('payments', JSON.stringify(payments)); // Save to localStorage
  filterClientPayments();
  alert('Payment added successfully!');

  document.getElementById('paymentDate').value = '';
  document.getElementById('paymentAmount').value = '';
}

// Filter payments for the selected client
function filterClientPayments() {
  const selectedClient = document.getElementById('clientTrackerName').value;
  const filteredPayments = payments.filter(payment => payment.clientName === selectedClient);

  const paymentTableBody = document.getElementById('paymentRecords');
  paymentTableBody.innerHTML = ''; // Clear previous records

  let totalPaid = 0;
  let totalBroker = 0;
  let totalClient = 0;

  filteredPayments.forEach(payment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${payment.clientName}</td>
      <td>${payment.paymentDate}</td>
      <td>${payment.paymentAmount.toFixed(2)}</td>
      <td>${payment.brokerAmount.toFixed(2)}</td>
      <td>${payment.clientPaid.toFixed(2)}</td>
    `;
    paymentTableBody.appendChild(row);

    totalPaid += payment.paymentAmount;
    totalBroker += payment.brokerAmount;
    totalClient += payment.clientPaid;
  });

  document.getElementById('totalAmountPaid').textContent = totalPaid.toFixed(2);
  document.getElementById('totalAmountPaidBroker').textContent = totalBroker.toFixed(2);
  document.getElementById('totalAmountPaidClient').textContent = totalClient.toFixed(2);
}
