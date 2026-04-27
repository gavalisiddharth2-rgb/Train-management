const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

let dbInstance = null;

async function initDb() {
    if (dbInstance) {
        try {
            await dbInstance.get('SELECT 1');
            return dbInstance;
        } catch (err) {
            console.warn('Database connection lost. Reconnecting...', err.message);
            dbInstance = null;
        }
    }

    let localDb = null;
    try {
        localDb = await open({
            filename: path.join(__dirname, process.env.DB_FILE || 'database.sqlite'),
            driver: sqlite3.Database
        });
    } catch (err) {
        console.warn('Failed to open database in current directory, trying /tmp...', err.message);
        localDb = await open({
            filename: '/tmp/database.sqlite',
            driver: sqlite3.Database
        });
    }

    await localDb.run('PRAGMA foreign_keys = ON;');

    await localDb.exec(`
        CREATE TABLE IF NOT EXISTS Admin (
            Admin_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username VARCHAR(100) UNIQUE NOT NULL,
            Password VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Train (
            Train_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Train_Name VARCHAR(100) NOT NULL,
            Source VARCHAR(100),
            Destination VARCHAR(100),
            Departure_Time TIME,
            Arrival_Time TIME
        );

        CREATE TABLE IF NOT EXISTS Passenger (
            Passenger_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name VARCHAR(100) NOT NULL,
            Age INT,
            Gender VARCHAR(10),
            Contact_Number VARCHAR(15) UNIQUE,
            Password VARCHAR(100) NOT NULL DEFAULT 'pass123'
        );

        CREATE TABLE IF NOT EXISTS Ticket (
            Ticket_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Passenger_ID INT,
            Train_ID INT,
            Booking_Date DATE,
            Seat_Number VARCHAR(10),
            Status VARCHAR(20) DEFAULT 'Booked',
            FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID) ON DELETE CASCADE,
            FOREIGN KEY (Train_ID) REFERENCES Train(Train_ID) ON DELETE CASCADE,
            UNIQUE (Train_ID, Seat_Number)
        );

        CREATE TABLE IF NOT EXISTS Technical_Supervisor (
            Supervisor_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name VARCHAR(100) NOT NULL,
            Contact_Number VARCHAR(15) UNIQUE,
            Assigned_Train_ID INT,
            Password VARCHAR(100) NOT NULL DEFAULT 'pass123',
            FOREIGN KEY (Assigned_Train_ID) REFERENCES Train(Train_ID) ON DELETE SET NULL
        );
    `);

    const { count } = await localDb.get('SELECT COUNT(*) as count FROM Train');
    if (count === 0) {
        await localDb.exec(`
            INSERT INTO Train (Train_Name, Source, Destination, Departure_Time, Arrival_Time) VALUES 
            ('Pune – Mumbai Deccan Express', 'Pune', 'Mumbai', '07:15:00', '11:05:00'),
            ('Pune – Mumbai Intercity Express', 'Pune', 'Mumbai', '17:55:00', '21:05:00'),
            ('Pune – Howrah Express', 'Pune', 'Howrah', '06:15:00', '18:20:00'),
            ('Pune – Nagpur Garib Rath Express', 'Pune', 'Nagpur', '17:40:00', '09:25:00'),
            ('Pune – Delhi Jhelum Express', 'Pune', 'Delhi', '17:20:00', '20:45:00'),
            ('Pune – Indore Express', 'Pune', 'Indore', '15:30:00', '08:30:00'),
            ('Pune – Jaipur Superfast Express', 'Pune', 'Jaipur', '15:30:00', '13:40:00'),
            ('Pune – Ahmedabad Duronto Express', 'Pune', 'Ahmedabad', '21:35:00', '06:20:00'),
            ('Pune – Secunderabad Shatabdi Express', 'Pune', 'Secunderabad', '06:00:00', '14:20:00'),
            ('Pune – Hyderabad Express', 'Pune', 'Hyderabad', '14:15:00', '04:00:00'),
            ('Pune – Chennai Express', 'Pune', 'Chennai', '23:50:00', '20:10:00'),
            ('Pune – Kanyakumari Express', 'Pune', 'Kanyakumari', '23:50:00', '11:50:00'),
            ('Pune – Kochuveli Express', 'Pune', 'Kochuveli', '23:50:00', '06:45:00'),
            ('Pune – Bhubaneswar Express', 'Pune', 'Bhubaneswar', '11:15:00', '16:40:00'),
            ('Pune – Patna Express', 'Pune', 'Patna', '20:50:00', '03:45:00'),
            ('Pune – Gorakhpur Express', 'Pune', 'Gorakhpur', '16:15:00', '00:05:00'),
            ('Pune – Lucknow Express', 'Pune', 'Lucknow', '22:00:00', '02:00:00'),
            ('Pune – Varanasi Express', 'Pune', 'Varanasi', '22:00:00', '04:00:00'),
            ('Pune – Bhopal Express', 'Pune', 'Bhopal', '15:15:00', '05:00:00'),
            ('Pune – Surat Express', 'Pune', 'Surat', '20:10:00', '04:15:00'),
            ('Pune – Kolhapur Mahalaxmi Express', 'Pune', 'Kolhapur', '00:10:00', '07:25:00'),
            ('Pune – Solapur Intercity Express', 'Pune', 'Solapur', '08:30:00', '13:00:00'),
            ('Pune – Nanded Express', 'Pune', 'Nanded', '21:35:00', '10:00:00'),
            ('Pune – Amritsar Express', 'Pune', 'Amritsar', '15:15:00', '22:15:00'),
            ('Pune – Chandigarh Express', 'Pune', 'Chandigarh', '15:15:00', '20:20:00'),
            ('Pune – Udaipur Express', 'Pune', 'Udaipur', '17:30:00', '12:20:00'),
            ('Pune – Jodhpur Express', 'Pune', 'Jodhpur', '20:10:00', '15:00:00'),
            ('Pune – Ranchi Express', 'Pune', 'Ranchi', '10:45:00', '16:00:00'),
            ('Pune – Guwahati Express', 'Pune', 'Guwahati', '06:10:00', '08:15:00'),
            ('Pune – Ernakulam Express', 'Pune', 'Ernakulam', '18:45:00', '18:50:00');
        `);
    }

    dbInstance = localDb;
    return dbInstance;
}

const db = {
    query: async (sql, params = []) => {
        const database = await initDb();
        const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA');
        if (isSelect) {
            const rows = await database.all(sql, params);
            return [rows];
        } else {
            const result = await database.run(sql, params);
            return [{ insertId: result.lastID, affectedRows: result.changes }];
        }
    }
};

// Initialize DB on startup
initDb().catch(console.error);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// ================= TRAINS =================
app.get('/api/trains', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Train');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/trains', async (req, res) => {
    const { Train_Name, Source, Destination, Departure_Time, Arrival_Time } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Train (Train_Name, Source, Destination, Departure_Time, Arrival_Time) VALUES (?, ?, ?, ?, ?)',
            [Train_Name, Source, Destination, Departure_Time, Arrival_Time]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/trains/:id', async (req, res) => {
    const { id } = req.params;
    const { Train_Name, Source, Destination, Departure_Time, Arrival_Time } = req.body;
    try {
        await db.query(
            'UPDATE Train SET Train_Name=?, Source=?, Destination=?, Departure_Time=?, Arrival_Time=? WHERE Train_ID=?',
            [Train_Name, Source, Destination, Departure_Time, Arrival_Time, id]
        );
        res.json({ message: 'Train updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/trains/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Train WHERE Train_ID=?', [req.params.id]);
        res.json({ message: 'Train deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= PASSENGERS =================
app.get('/api/passengers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Passenger');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/passengers', async (req, res) => {
    const { Name, Age, Gender, Contact_Number } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Passenger (Name, Age, Gender, Contact_Number) VALUES (?, ?, ?, ?)',
            [Name, Age, Gender, Contact_Number]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/passengers/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Age, Gender, Contact_Number } = req.body;
    try {
        await db.query(
            'UPDATE Passenger SET Name=?, Age=?, Gender=?, Contact_Number=? WHERE Passenger_ID=?',
            [Name, Age, Gender, Contact_Number, id]
        );
        res.json({ message: 'Passenger updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/passengers/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Passenger WHERE Passenger_ID=?', [req.params.id]);
        res.json({ message: 'Passenger deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= TICKETS =================
app.get('/api/tickets', async (req, res) => {
    try {
        const query = `
            SELECT t.Ticket_ID, t.Booking_Date, t.Seat_Number, t.Status,
                   p.Name AS Passenger_Name, p.Passenger_ID, 
                   tr.Train_Name AS Train_Name, tr.Train_ID
            FROM Ticket t
            JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
            JOIN Train tr ON t.Train_ID = tr.Train_ID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tickets', async (req, res) => {
    const { Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Ticket (Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status) VALUES (?, ?, ?, ?, ?)',
            [Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status || 'Booked']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
    try {
        await db.query(
            'UPDATE Ticket SET Status=? WHERE Ticket_ID=?',
            [Status, id]
        );
        res.json({ message: 'Ticket status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Ticket WHERE Ticket_ID=?', [req.params.id]);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= SUPERVISORS =================
app.get('/api/supervisors', async (req, res) => {
    try {
        const query = `
            SELECT s.Supervisor_ID, s.Name, s.Contact_Number, s.Assigned_Train_ID,
                   t.Train_Name
            FROM Technical_Supervisor s
            LEFT JOIN Train t ON s.Assigned_Train_ID = t.Train_ID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/supervisors', async (req, res) => {
    const { Name, Contact_Number, Assigned_Train_ID } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Technical_Supervisor (Name, Contact_Number, Assigned_Train_ID) VALUES (?, ?, ?)',
            [Name, Contact_Number, Assigned_Train_ID || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/supervisors/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Contact_Number, Assigned_Train_ID } = req.body;
    try {
        await db.query(
            'UPDATE Technical_Supervisor SET Name=?, Contact_Number=?, Assigned_Train_ID=? WHERE Supervisor_ID=?',
            [Name, Contact_Number, Assigned_Train_ID || null, id]
        );
        res.json({ message: 'Supervisor updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/supervisors/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Technical_Supervisor WHERE Supervisor_ID=?', [req.params.id]);
        res.json({ message: 'Supervisor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= AUTHENTICATION =================
app.post('/api/login', async (req, res) => {
    const { role, identifier, password } = req.body;
    try {
        let user = null;
        if (role === 'Admin') {
            const [rows] = await db.query('SELECT * FROM Admin WHERE Username=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Admin_ID, name: rows[0].Username, role: 'Admin' };
        } else if (role === 'Passenger') {
            const [rows] = await db.query('SELECT * FROM Passenger WHERE Contact_Number=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Passenger_ID, name: rows[0].Name, role: 'Passenger' };
        } else if (role === 'Supervisor') {
            const [rows] = await db.query('SELECT * FROM Technical_Supervisor WHERE Contact_Number=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Supervisor_ID, name: rows[0].Name, role: 'Supervisor' };
        }

        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { role, identifier, password, name, age, gender } = req.body;
    try {
        if (role === 'Admin') {
            await db.query('INSERT INTO Admin (Username, Password) VALUES (?, ?)', [identifier, password]);
        } else if (role === 'Passenger') {
            await db.query('INSERT INTO Passenger (Name, Age, Gender, Contact_Number, Password) VALUES (?, ?, ?, ?, ?)', 
                [name, age, gender, identifier, password]);
        } else if (role === 'Supervisor') {
            await db.query('INSERT INTO Technical_Supervisor (Name, Contact_Number, Password) VALUES (?, ?, ?)', 
                [name, identifier, password]);
        }
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Identifier already exists. Please choose another.' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// ================= PASSENGER SPECIFIC =================
app.get('/api/passenger-tickets/:passengerId', async (req, res) => {
    try {
        const query = `
            SELECT t.Ticket_ID, t.Booking_Date, t.Seat_Number, t.Status,
                   p.Name AS Passenger_Name, p.Passenger_ID, 
                   tr.Train_Name AS Train_Name, tr.Train_ID, tr.Source, tr.Destination, tr.Departure_Time, tr.Arrival_Time
            FROM Ticket t
            JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
            JOIN Train tr ON t.Train_ID = tr.Train_ID
            WHERE t.Passenger_ID = ?
        `;
        const [rows] = await db.query(query, [req.params.passengerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= SUPERVISOR SPECIFIC =================
app.get('/api/supervisor-train/:supervisorId', async (req, res) => {
    try {
        const query = `
            SELECT t.*
            FROM Train t
            JOIN Technical_Supervisor s ON s.Assigned_Train_ID = t.Train_ID
            WHERE s.Supervisor_ID = ?
        `;
        const [rows] = await db.query(query, [req.params.supervisorId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback to index.html for undefined routes (Single Page App approach)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
