import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import { database } from "../config/database"

const router = express.Router()

// Register route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, password } = req.body

      // Check if user already exists
      const existingUser = await database.query(
        `
        SELECT id FROM Users WHERE email = @email
      `,
        { email }
      )

      if (existingUser.recordset.length > 0) {
        return res.status(400).json({ message: "User already exists" })
      }

      // Hash password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user
      const result = await database.query(
        `
        INSERT INTO Users (name, email, password_hash, role, created_at)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
        VALUES (@name, @email, @password_hash, 'user', GETDATE())
      `,
        {
          name,
          email,
          password_hash: hashedPassword,
        }
      )

      const user = result.recordset[0]

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      )

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  }
)

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user
      const result = await database.query(
        `
        SELECT id, name, email, password_hash, role 
        FROM Users 
        WHERE email = @email
      `,
        { email }
      )

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      const user = result.recordset[0]

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      )

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  }
)

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any

    const result = await database.query(
      `
      SELECT id, name, email, role, created_at
      FROM Users 
      WHERE id = @id
    `,
      { id: decoded.id }
    )

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = result.recordset[0]
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

export default router
