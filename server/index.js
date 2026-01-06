import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize Database Table (simplified check, full migration via script)
const initDb = async () => {
    try {
        const client = await pool.connect();
        // Check if table exists just to log status
        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'passwords'
            );
        `);

        if (res.rows[0].exists) {
            console.log('✅ Connected to Database: passwords table exists');
        } else {
            console.log('⚠️ Database table "passwords" missing. Please run "npm run migrate"');
        }
        client.release();
    } catch (err) {
        console.error('❌ Failed to connect to database:', err);
    }
};

initDb();

// Routes

// GET /api/passwords - List all passwords
app.get('/api/passwords', async (req, res) => {
    try {
        const { searchQuery } = req.query;
        let query = 'SELECT * FROM passwords ORDER BY updated_at DESC';
        let params = [];

        if (searchQuery) {
            query = `
        SELECT * FROM passwords 
        WHERE service ILIKE $1 OR username ILIKE $1 
        ORDER BY updated_at DESC
      `;
            params = [`%${searchQuery}%`];
        }

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/passwords - Create new password
app.post('/api/passwords', async (req, res) => {
    try {
        const { service, username, password } = req.body;
        // Trigger will handle updated_at
        const { rows } = await pool.query(
            'INSERT INTO passwords (service, username, password) VALUES ($1, $2, $3) RETURNING *',
            [service, username, password]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/passwords/:id - Update password
app.put('/api/passwords/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { service, username, password } = req.body;
        // Trigger handles updated_at automatically, no need to set explicitly in query
        const { rows } = await pool.query(
            'UPDATE passwords SET service = $1, username = $2, password = $3 WHERE id = $4 RETURNING *',
            [service, username, password, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Password not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/passwords/:id - Delete password
app.delete('/api/passwords/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM passwords WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Password not found' });
        }
        res.json({ message: 'Password deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
