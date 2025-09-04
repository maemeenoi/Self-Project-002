import sql from "mssql"

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "finops_portal",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true" || true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

class Database {
  private pool: sql.ConnectionPool | null = null

  async connect() {
    try {
      this.pool = await sql.connect(config)
      console.log("📊 Connected to SQL Server database")

      // Initialize database schema
      await this.initializeSchema()
    } catch (error) {
      console.error("Database connection error:", error)
      throw error
    }
  }

  async query(queryText: string, params?: any) {
    if (!this.pool) {
      throw new Error("Database not connected")
    }

    const request = this.pool.request()

    // Add parameters if provided
    if (params) {
      Object.keys(params).forEach((key) => {
        request.input(key, params[key])
      })
    }

    return request.query(queryText)
  }

  private async initializeSchema() {
    try {
      // Create Users table
      await this.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
        CREATE TABLE Users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          email NVARCHAR(255) UNIQUE NOT NULL,
          password_hash NVARCHAR(255) NOT NULL,
          role NVARCHAR(50) DEFAULT 'user',
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        )
      `)

      // Create CostUploads table
      await this.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CostUploads' AND xtype='U')
        CREATE TABLE CostUploads (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          filename NVARCHAR(255) NOT NULL,
          original_name NVARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type NVARCHAR(100),
          upload_date DATETIME2 DEFAULT GETDATE(),
          status NVARCHAR(50) DEFAULT 'processing',
          records_processed INT DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
      `)

      // Create NormalizedCost table
      await this.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NormalizedCost' AND xtype='U')
        CREATE TABLE NormalizedCost (
          id INT IDENTITY(1,1) PRIMARY KEY,
          upload_id INT NOT NULL,
          service_name NVARCHAR(255) NOT NULL,
          cost_amount DECIMAL(18,4) NOT NULL,
          currency NVARCHAR(10) DEFAULT 'USD',
          time_period DATE NOT NULL,
          category NVARCHAR(100),
          sub_category NVARCHAR(100),
          region NVARCHAR(100),
          resource_id NVARCHAR(255),
          tags NVARCHAR(MAX),
          created_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (upload_id) REFERENCES CostUploads(id) ON DELETE CASCADE
        )
      `)

      // Create indexes for better performance
      await this.query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NormalizedCost_TimePeriod')
        CREATE INDEX IX_NormalizedCost_TimePeriod ON NormalizedCost(time_period)
      `)

      await this.query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NormalizedCost_Service')
        CREATE INDEX IX_NormalizedCost_Service ON NormalizedCost(service_name)
      `)

      console.log("📚 Database schema initialized successfully")
    } catch (error) {
      console.error("Schema initialization error:", error)
      throw error
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.close()
      this.pool = null
      console.log("📊 Disconnected from database")
    }
  }
}

export const database = new Database()

// Initialize database connection
database.connect().catch((error) => {
  console.error("Failed to initialize database:", error)
  process.exit(1)
})
