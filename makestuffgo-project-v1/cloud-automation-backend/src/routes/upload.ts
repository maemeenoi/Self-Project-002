import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import csv from "csv-parser"
import XLSX from "xlsx"
import { authenticate } from "../middleware/auth"
import { database } from "../config/database"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    )
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|json|xlsx|xls/
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype =
      allowedTypes.test(file.mimetype) ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only CSV, JSON, and Excel files are allowed"))
    }
  },
})

// Upload cost data endpoint
router.post(
  "/cost-data",
  authenticate,
  upload.single("file"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      const { file, user } = req

      // Record the upload in database
      const uploadResult = await database.query(
        `
      INSERT INTO CostUploads (user_id, filename, original_name, file_size, mime_type, status)
      OUTPUT INSERTED.id
      VALUES (@user_id, @filename, @original_name, @file_size, @mime_type, 'processing')
    `,
        {
          user_id: user.id,
          filename: file.filename,
          original_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype,
        }
      )

      const uploadId = uploadResult.recordset[0].id

      // Process the file asynchronously
      processFile(file.path, uploadId, file.mimetype)

      res.json({
        success: true,
        message: "File uploaded successfully and processing started",
        uploadId,
        filename: file.originalname,
        size: file.size,
      })
    } catch (error) {
      console.error("Upload error:", error)
      res.status(500).json({ message: "File upload failed" })
    }
  }
)

// Get upload status
router.get("/status/:uploadId", authenticate, async (req: any, res) => {
  try {
    const { uploadId } = req.params

    const result = await database.query(
      `
      SELECT id, original_name, status, records_processed, upload_date
      FROM CostUploads 
      WHERE id = @uploadId AND user_id = @user_id
    `,
      {
        uploadId,
        user_id: req.user.id,
      }
    )

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Upload not found" })
    }

    res.json({
      success: true,
      upload: result.recordset[0],
    })
  } catch (error) {
    console.error("Status check error:", error)
    res.status(500).json({ message: "Failed to get upload status" })
  }
})

// Get user's uploads
router.get("/uploads", authenticate, async (req: any, res) => {
  try {
    const result = await database.query(
      `
      SELECT id, original_name, file_size, status, records_processed, upload_date
      FROM CostUploads 
      WHERE user_id = @user_id
      ORDER BY upload_date DESC
    `,
      {
        user_id: req.user.id,
      }
    )

    res.json({
      success: true,
      uploads: result.recordset,
    })
  } catch (error) {
    console.error("Get uploads error:", error)
    res.status(500).json({ message: "Failed to get uploads" })
  }
})

// Process uploaded file
async function processFile(
  filePath: string,
  uploadId: number,
  mimeType: string
) {
  try {
    let records: any[] = []

    if (mimeType.includes("csv") || mimeType.includes("text")) {
      records = await parseCSV(filePath)
    } else if (mimeType.includes("json")) {
      records = await parseJSON(filePath)
    } else if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      records = await parseExcel(filePath)
    }

    // Normalize and insert records
    let processedCount = 0
    for (const record of records) {
      try {
        const normalizedRecord = normalizeRecord(record)
        if (normalizedRecord) {
          await insertNormalizedRecord(uploadId, normalizedRecord)
          processedCount++
        }
      } catch (error) {
        console.error("Record processing error:", error)
      }
    }

    // Update upload status
    await database.query(
      `
      UPDATE CostUploads 
      SET status = 'completed', records_processed = @records_processed
      WHERE id = @uploadId
    `,
      {
        uploadId,
        records_processed: processedCount,
      }
    )

    console.log(`Processed ${processedCount} records for upload ${uploadId}`)
  } catch (error) {
    console.error("File processing error:", error)

    // Update status to failed
    await database.query(
      `
      UPDATE CostUploads 
      SET status = 'failed'
      WHERE id = @uploadId
    `,
      { uploadId }
    )
  } finally {
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

// Parse CSV file
function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => records.push(data))
      .on("end", () => resolve(records))
      .on("error", reject)
  })
}

// Parse JSON file
function parseJSON(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(filePath, "utf8")
      const json = JSON.parse(data)
      resolve(Array.isArray(json) ? json : [json])
    } catch (error) {
      reject(error)
    }
  })
}

// Parse Excel file
function parseExcel(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// Normalize record to FOCUS-compliant schema
function normalizeRecord(record: any) {
  try {
    return {
      service_name:
        record.ServiceName || record.service || record.Service || "Unknown",
      cost_amount: parseFloat(
        record.Cost || record.cost || record.Amount || record.amount || "0"
      ),
      currency: record.Currency || record.currency || "USD",
      time_period: new Date(
        record.Date ||
          record.date ||
          record.Period ||
          record.period ||
          new Date()
      ),
      category:
        record.Category || record.category || record.ResourceType || "Other",
      sub_category:
        record.SubCategory ||
        record.subcategory ||
        record.ResourceGroup ||
        null,
      region: record.Region || record.region || record.Location || null,
      resource_id: record.ResourceId || record.resource_id || record.Id || null,
      tags: JSON.stringify(record.Tags || record.tags || {}),
    }
  } catch (error) {
    console.error("Record normalization error:", error)
    return null
  }
}

// Insert normalized record
async function insertNormalizedRecord(uploadId: number, record: any) {
  await database.query(
    `
    INSERT INTO NormalizedCost (
      upload_id, service_name, cost_amount, currency, time_period,
      category, sub_category, region, resource_id, tags
    )
    VALUES (
      @upload_id, @service_name, @cost_amount, @currency, @time_period,
      @category, @sub_category, @region, @resource_id, @tags
    )
  `,
    {
      upload_id: uploadId,
      ...record,
    }
  )
}

export default router
