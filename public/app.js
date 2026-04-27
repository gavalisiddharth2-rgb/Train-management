const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' 
    ? 'http://localhost:3000/api' 
    : '/api';

// --- Modal Utilities ---
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    if(modalId === 'trainModal') document.getElementById('trainForm').reset();
    if(modalId === 'passengerModal') document.getElementById('passengerForm').reset();
    if(modalId === 'ticketModal') {
        document.getElementById('ticketForm').reset();
        document.getElementById('statusGroup').style.display = 'none';
        document.getElementById('modalTitle').innerText = 'Book New Ticket';
    }
    if(modalId === 'supervisorModal') {
        document.getElementById('supervisorForm').reset();
        document.getElementById('modalTitle').innerText = 'Add New Supervisor';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// FORMAT DATE UTILS
function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString();
}

// ================= TRAINS =================
async function fetchTrains() {
    try {
        const res = await fetch(`${API_URL}/trains`);
        const trains = await res.json();
        const tbody = document.getElementById('trainsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        trains.forEach(train => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${train.Train_ID}</td>
                <td>${train.Train_Name}</td>
                <td>${train.Source}</td>
                <td>${train.Destination}</td>
                <td>${formatDateTime(train.Departure_Time)}</td>
                <td>${formatDateTime(train.Arrival_Time)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="editTrain(${train.Train_ID}, '${train.Train_Name}', '${train.Source}', '${train.Destination}', '${train.Departure_Time}', '${train.Arrival_Time}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTrain(${train.Train_ID})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function editTrain(id, name, source, destination, departure, arrival) {
    document.getElementById('modalTitle').innerText = 'Edit Train';
    document.getElementById('Train_ID').value = id;
    document.getElementById('Train_Name').value = name;
    document.getElementById('Source').value = source;
    document.getElementById('Destination').value = destination;
    
    // Format for datetime-local or time depending on input type
    const depTime = document.getElementById('Departure_Time');
    const arrTime = document.getElementById('Arrival_Time');
    
    try {
        if(depTime.type === 'datetime-local') depTime.value = new Date(departure).toISOString().slice(0, 16);
        else depTime.value = departure;
        
        if(arrTime.type === 'datetime-local') arrTime.value = new Date(arrival).toISOString().slice(0, 16);
        else arrTime.value = arrival;
    } catch (e) {
        depTime.value = departure;
        arrTime.value = arrival;
    }
    
    document.getElementById('trainModal').classList.add('active');
}

async function handleTrainSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('Train_ID').value;
    const trainData = {
        Train_Name: document.getElementById('Train_Name').value,
        Source: document.getElementById('Source').value,
        Destination: document.getElementById('Destination').value,
        Departure_Time: document.getElementById('Departure_Time').value,
        Arrival_Time: document.getElementById('Arrival_Time').value,
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/trains/${id}` : `${API_URL}/trains`;

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainData)
        });
        closeModal('trainModal');
        fetchTrains();
    } catch (err) {
        console.error(err);
    }
}

async function deleteTrain(id) {
    if (confirm('Are you sure you want to delete this train?')) {
        await fetch(`${API_URL}/trains/${id}`, { method: 'DELETE' });
        fetchTrains();
    }
}

// ================= PASSENGERS =================
async function fetchPassengers() {
    try {
        const res = await fetch(`${API_URL}/passengers`);
        const passengers = await res.json();
        const tbody = document.getElementById('passengersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        passengers.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.Passenger_ID}</td>
                <td>${p.Name}</td>
                <td>${p.Age}</td>
                <td>${p.Gender}</td>
                <td>${p.Contact_Number}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="editPassenger(${p.Passenger_ID}, '${p.Name}', ${p.Age}, '${p.Gender}', '${p.Contact_Number}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deletePassenger(${p.Passenger_ID})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function editPassenger(id, name, age, gender, contact) {
    document.getElementById('modalTitle').innerText = 'Edit Passenger';
    document.getElementById('Passenger_ID').value = id;
    document.getElementById('Name').value = name;
    document.getElementById('Age').value = age;
    document.getElementById('Gender').value = gender;
    document.getElementById('Contact_Number').value = contact;
    document.getElementById('passengerModal').classList.add('active');
}

async function handlePassengerSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('Passenger_ID').value;
    const data = {
        Name: document.getElementById('Name').value,
        Age: document.getElementById('Age').value,
        Gender: document.getElementById('Gender').value,
        Contact_Number: document.getElementById('Contact_Number').value,
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/passengers/${id}` : `${API_URL}/passengers`;

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal('passengerModal');
        fetchPassengers();
    } catch (err) {
        console.error(err);
    }
}

async function deletePassenger(id) {
    if (confirm('Are you sure you want to delete this passenger?')) {
        await fetch(`${API_URL}/passengers/${id}`, { method: 'DELETE' });
        fetchPassengers();
    }
}

// ================= TICKETS =================
async function fetchTickets() {
    try {
        const res = await fetch(`${API_URL}/tickets`);
        const tickets = await res.json();
        const tbody = document.getElementById('ticketsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        tickets.forEach(t => {
            let statusColor = t.Status === 'Booked' ? 'var(--success)' : 
                             (t.Status === 'Waiting' ? '#f59e0b' : 'var(--danger)');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>TKT-${t.Ticket_ID}</td>
                <td>${t.Passenger_Name}</td>
                <td>${t.Train_Name}</td>
                <td>${formatDate(t.Booking_Date)}</td>
                <td>${t.Seat_Number}</td>
                <td style="color: ${statusColor}; font-weight: 600;">${t.Status}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="editTicketStatus(${t.Ticket_ID}, '${t.Status}')" title="Change Status"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTicket(${t.Ticket_ID})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadDropdowns() {
    try {
        // Load Passengers
        const pRes = await fetch(`${API_URL}/passengers`);
        const passengers = await pRes.json();
        const pSelect = document.getElementById('Passenger_ID');
        if(pSelect) {
            pSelect.innerHTML = '<option value="">Select Passenger...</option>';
            passengers.forEach(p => {
                pSelect.innerHTML += `<option value="${p.Passenger_ID}">${p.Name} (ID: ${p.Passenger_ID})</option>`;
            });
        }

        // Load Trains
        const tRes = await fetch(`${API_URL}/trains`);
        const trains = await tRes.json();
        const tSelect = document.getElementById('Train_ID');
        if(tSelect) {
            tSelect.innerHTML = '<option value="">Select Train...</option>';
            trains.forEach(t => {
                tSelect.innerHTML += `<option value="${t.Train_ID}">${t.Train_Name} (${t.Source} to ${t.Destination})</option>`;
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function openTicketModal() {
    document.getElementById('ticketForm').reset();
    document.getElementById('Ticket_ID').value = '';
    document.getElementById('Passenger_ID').disabled = false;
    document.getElementById('Train_ID').disabled = false;
    document.getElementById('Booking_Date').disabled = false;
    document.getElementById('Seat_Number').disabled = false;
    document.getElementById('statusGroup').style.display = 'none';
    document.getElementById('modalTitle').innerText = 'Book New Ticket';
    document.getElementById('ticketModal').classList.add('active');
}

function editTicketStatus(id, status) {
    document.getElementById('modalTitle').innerText = 'Edit Ticket Status';
    document.getElementById('Ticket_ID').value = id;
    
    // Disable other fields
    document.getElementById('Passenger_ID').disabled = true;
    document.getElementById('Train_ID').disabled = true;
    document.getElementById('Booking_Date').disabled = true;
    document.getElementById('Seat_Number').disabled = true;
    
    document.getElementById('statusGroup').style.display = 'block';
    document.getElementById('Status').value = status;
    
    document.getElementById('ticketModal').classList.add('active');
}

async function handleTicketSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('Ticket_ID').value;
    
    if (id) {
        // Update Status only
        const Status = document.getElementById('Status').value;
        try {
            await fetch(`${API_URL}/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Status })
            });
        } catch (err) { console.error(err); }
    } else {
        // Book new ticket
        const data = {
            Passenger_ID: document.getElementById('Passenger_ID').value,
            Train_ID: document.getElementById('Train_ID').value,
            Booking_Date: document.getElementById('Booking_Date').value,
            Seat_Number: document.getElementById('Seat_Number').value,
            Status: 'Booked'
        };
        try {
            await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) { console.error(err); }
    }
    
    closeModal('ticketModal');
    fetchTickets();
}

async function deleteTicket(id) {
    if (confirm('Cancel and delete this ticket?')) {
        await fetch(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
        fetchTickets();
    }
}

// ================= SUPERVISORS =================
async function fetchSupervisors() {
    try {
        const res = await fetch(`${API_URL}/supervisors`);
        const supervisors = await res.json();
        const tbody = document.getElementById('supervisorsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        supervisors.forEach(s => {
            const trainName = s.Train_Name ? s.Train_Name : '<span style="color: var(--text-secondary)">Unassigned</span>';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>SUP-${s.Supervisor_ID}</td>
                <td>${s.Name}</td>
                <td>${s.Contact_Number}</td>
                <td>${trainName}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="editSupervisor(${s.Supervisor_ID}, '${s.Name}', '${s.Contact_Number}', '${s.Assigned_Train_ID}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupervisor(${s.Supervisor_ID})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadSupervisorDropdowns() {
    try {
        const tRes = await fetch(`${API_URL}/trains`);
        const trains = await tRes.json();
        const tSelect = document.getElementById('Assigned_Train_ID');
        if(tSelect) {
            tSelect.innerHTML = '<option value="">None (Unassigned)</option>';
            trains.forEach(t => {
                tSelect.innerHTML += `<option value="${t.Train_ID}">${t.Train_Name}</option>`;
            });
        }
    } catch(err) {
        console.error(err);
    }
}

function openSupervisorModal() {
    document.getElementById('supervisorForm').reset();
    document.getElementById('Supervisor_ID').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Supervisor';
    document.getElementById('supervisorModal').classList.add('active');
}

function editSupervisor(id, name, contact, trainId) {
    document.getElementById('modalTitle').innerText = 'Edit Supervisor';
    document.getElementById('Supervisor_ID').value = id;
    document.getElementById('Name').value = name;
    document.getElementById('Contact_Number').value = contact;
    document.getElementById('Assigned_Train_ID').value = trainId !== 'null' ? trainId : '';
    document.getElementById('supervisorModal').classList.add('active');
}

async function handleSupervisorSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('Supervisor_ID').value;
    const data = {
        Name: document.getElementById('Name').value,
        Contact_Number: document.getElementById('Contact_Number').value,
        Assigned_Train_ID: document.getElementById('Assigned_Train_ID').value || null,
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/supervisors/${id}` : `${API_URL}/supervisors`;

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal('supervisorModal');
        fetchSupervisors();
    } catch (err) {
        console.error(err);
    }
}

async function deleteSupervisor(id) {
    if (confirm('Are you sure you want to delete this supervisor?')) {
        await fetch(`${API_URL}/supervisors/${id}`, { method: 'DELETE' });
        fetchSupervisors();
    }
}

// ================= AUTHENTICATION & MULTI-ROLE =================
let currentAuthMode = 'login';

function toggleAuthMode(mode) {
    currentAuthMode = mode;
    document.querySelectorAll('.auth-toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${mode}`).classList.add('active');
    
    if (mode === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
    selectRole(document.getElementById('loginRole').value);
}

function selectRole(role) {
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${role}`).classList.add('active');
    document.getElementById('loginRole').value = role;
    
    // Update Login UI
    const idLabel = document.getElementById('identifierLabel');
    if (idLabel) {
        if (role === 'Admin') idLabel.innerText = 'Username';
        else idLabel.innerText = 'Contact Number';
    }

    // Update Register UI
    const regIdLabel = document.getElementById('regIdentifierLabel');
    if (regIdLabel) {
        if (role === 'Admin') regIdLabel.innerText = 'Username';
        else regIdLabel.innerText = 'Contact Number';
        
        if (role === 'Admin') {
            document.getElementById('regNameGroup').style.display = 'none';
            document.getElementById('regAgeGroup').style.display = 'none';
            document.getElementById('regGenderGroup').style.display = 'none';
        } else if (role === 'Supervisor') {
            document.getElementById('regNameGroup').style.display = 'block';
            document.getElementById('regAgeGroup').style.display = 'none';
            document.getElementById('regGenderGroup').style.display = 'none';
        } else if (role === 'Passenger') {
            document.getElementById('regNameGroup').style.display = 'block';
            document.getElementById('regAgeGroup').style.display = 'block';
            document.getElementById('regGenderGroup').style.display = 'block';
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const identifier = document.getElementById('regIdentifier').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName') ? document.getElementById('regName').value : null;
    const age = document.getElementById('regAge') ? document.getElementById('regAge').value : null;
    const gender = document.getElementById('regGender') ? document.getElementById('regGender').value : null;

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, identifier, password, name, age, gender })
        });
        
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please login.');
            toggleAuthMode('login');
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during registration.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, identifier, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            
            if (data.user.role === 'Admin') navigateTo('admin_dashboard');
            else if (data.user.role === 'Passenger') navigateTo('passenger_dashboard');
            else if (data.user.role === 'Supervisor') navigateTo('supervisor_dashboard');
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during login.');
    }
}

function logout() {
    localStorage.removeItem('user');
    navigateTo('index');
}

function checkAuth(requiredRole) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (requiredRole && user.role !== requiredRole)) {
        alert('Unauthorized access. Please login.');
        navigateTo('index');
    } else {
        const welcome = document.getElementById('welcomeUser');
        if (welcome) welcome.innerText = `Welcome, ${user.name}`;
    }
}

// ================= PASSENGER DASHBOARD =================
async function loadPassengerDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        // Load Available Trains
        const trRes = await fetch(`${API_URL}/trains`);
        const trains = await trRes.json();
        const tBody = document.getElementById('passengerTrainsBody');
        if (tBody) {
            tBody.innerHTML = '';
            trains.forEach(t => {
                tBody.innerHTML += `
                    <tr>
                        <td>${t.Train_Name}</td>
                        <td>${t.Source} <i class="fa-solid fa-arrow-right" style="color:var(--text-secondary); margin:0 5px;"></i> ${t.Destination}</td>
                        <td>${formatDateTime(t.Departure_Time)}</td>
                        <td>${formatDateTime(t.Arrival_Time)}</td>
                        <td><button class="btn btn-sm btn-primary" onclick="openPaymentModal(${t.Train_ID}, '${t.Train_Name}')">Book Now</button></td>
                    </tr>
                `;
            });
        }

        // Load My Tickets
        const tktRes = await fetch(`${API_URL}/passenger-tickets/${user.id}`);
        const tickets = await tktRes.json();
        const mtBody = document.getElementById('myTicketsBody');
        if (mtBody) {
            mtBody.innerHTML = '';
            tickets.forEach(t => {
                let statusColor = t.Status === 'Booked' ? 'var(--success)' : (t.Status === 'Waiting' ? '#f59e0b' : 'var(--danger)');
                mtBody.innerHTML += `
                    <tr>
                        <td>TKT-${t.Ticket_ID}</td>
                        <td>${t.Train_Name}</td>
                        <td>${t.Source} to ${t.Destination}</td>
                        <td>${formatDate(t.Booking_Date)}</td>
                        <td>${t.Seat_Number}</td>
                        <td style="color: ${statusColor}; font-weight: bold;">${t.Status}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function switchPayTab(tabId) {
    // Hide all sections
    document.querySelectorAll('.pay-section').forEach(el => el.style.display = 'none');
    // Remove active class from all tabs
    document.querySelectorAll('.pay-tab').forEach(el => el.classList.remove('active'));
    
    // Show selected section and activate tab
    document.getElementById(`pay-${tabId}`).style.display = 'block';
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

function openPaymentModal(trainId, trainName) {
    document.getElementById('paymentForm').reset();
    document.getElementById('bookTrainId').value = trainId;
    document.getElementById('paymentTitle').innerText = `Book Ticket for ${trainName}`;
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('paymentSpinner').style.display = 'none';
    document.getElementById('paymentSuccess').style.display = 'none';
    document.getElementById('paymentModal').classList.add('active');
}

async function processPayment(e) {
    e.preventDefault();
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('paymentSpinner').style.display = 'block';

    const user = JSON.parse(localStorage.getItem('user'));
    const trainId = document.getElementById('bookTrainId').value;
    const date = document.getElementById('bookDate').value;
    const seat = document.getElementById('bookSeat').value;

    // Simulate Payment Delay
    setTimeout(async () => {
        try {
            await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Passenger_ID: user.id,
                    Train_ID: trainId,
                    Booking_Date: date,
                    Seat_Number: seat,
                    Status: 'Booked'
                })
            });
            document.getElementById('paymentSpinner').style.display = 'none';
            document.getElementById('paymentSuccess').style.display = 'block';
            setTimeout(() => {
                closeModal('paymentModal');
                loadPassengerDashboard(); // Refresh tickets
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Booking failed');
        }
    }, 2000);
}

// ================= SUPERVISOR DASHBOARD =================
async function loadSupervisorDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const res = await fetch(`${API_URL}/supervisor-train/${user.id}`);
        const trains = await res.json();
        
        if (trains.length > 0) {
            const t = trains[0];
            document.getElementById('noTrainMessage').style.display = 'none';
            document.getElementById('trainDetailsCard').style.display = 'block';
            
            document.getElementById('supTrainName').innerText = t.Train_Name;
            document.getElementById('supTrainSource').innerText = t.Source;
            document.getElementById('supTrainDestination').innerText = t.Destination;
            document.getElementById('supTrainDeparture').innerText = formatDateTime(t.Departure_Time);
            document.getElementById('supTrainArrival').innerText = formatDateTime(t.Arrival_Time);
        } else {
            document.getElementById('noTrainMessage').style.display = 'block';
            document.getElementById('trainDetailsCard').style.display = 'none';
        }
    } catch (err) {
        console.error(err);
    }
}
