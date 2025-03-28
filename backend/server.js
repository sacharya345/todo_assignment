import express from "express"
import cors from "cors"
import pg from "pg"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("../frontend"))

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

// Initialize database
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("Database initialized")
  } catch (err) {
    console.error("Error initializing database:", err)
  }
}

initDb()

// API Routes

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC")
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching todos:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// Add a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { task } = req.body
    if (!task) {
      return res.status(400).json({ error: "Task is required" })
    }

    const result = await pool.query("INSERT INTO todos (task) VALUES ($1) RETURNING *", [task])

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error("Error adding todo:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// Update a todo (toggle completed status)
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    const result = await pool.query("UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *", [completed, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Error updating todo:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" })
    }

    res.json({ message: "Todo deleted successfully" })
  } catch (err) {
    console.error("Error deleting todo:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
