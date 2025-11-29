/**
 * Backend API Example - Admin Login
 * 
 * This is an example Express.js endpoint for handling admin login.
 * You'll need to adapt this to your actual backend framework and database.
 * 
 * Installation:
 * npm install express cors dotenv bcryptjs jsonwebtoken
 */

// Example using Node.js/Express with Firebase or any database
// Place this in your backend server

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * POST /api/admin/login
 * 
 * Request body:
 * {
 *   "username": "admin",
 *   "password": "password123"
 * }
 * 
 * Response (success):
 * {
 *   "username": "admin",
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 * 
 * Response (error):
 * {
 *   "message": "Invalid credentials"
 * }
 */

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Example: Query your database for the admin user
    // Replace this with your actual database query
    const adminUser = await getAdminFromDatabase(username);

    if (!adminUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (valid for 24 hours)
    const token = jwt.sign(
      { username: adminUser.username, id: adminUser.id },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Return success response
    res.json({
      username: adminUser.username,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Example database function
 * Replace this with your actual database query logic
 */
async function getAdminFromDatabase(username) {
  // Example with Firebase Firestore
  // const db = admin.firestore();
  // const doc = await db.collection("admins").doc(username).get();
  // return doc.data();

  // Or with a traditional SQL database
  // const result = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
  // return result.rows[0];

  // For now, returning null - you need to implement this
  return null;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create admin users in your database with hashed passwords:
 *    - Use bcrypt to hash passwords before storing
 *    - Example:
 *      const hashedPassword = await bcrypt.hash("your-password", 10);
 * 
 * 2. Store admin records with structure:
 *    {
 *      id: "unique-id",
 *      username: "admin",
 *      passwordHash: "$2b$10$...", // bcrypt hashed password
 *      email: "admin@example.com" (optional)
 *    }
 * 
 * 3. Update your .env file:
 *    JWT_SECRET=your-secure-secret-key
 * 
 * 4. To create a new admin, use this utility:
 */

async function createAdmin(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  // Save to your database:
  // await db.collection("admins").doc(username).set({
  //   username,
  //   passwordHash: hashedPassword,
  //   createdAt: new Date()
  // });
  console.log(`Admin user "${username}" created with hashed password`);
}

// Run once to create an admin:
// createAdmin("admin", "your-secure-password");
