import express from "express"
import { authenticate } from "../middleware/auth"
import { database } from "../config/database"

const router = express.Router()

// Get dashboard summary data
router.get("/summary", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id

    // Get total cost for current month
    const totalCostResult = await database.query(
      `
      SELECT 
        ISNULL(SUM(nc.cost_amount), 0) as total_cost,
        COUNT(DISTINCT nc.service_name) as services_count
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      WHERE cu.user_id = @user_id
        AND MONTH(nc.time_period) = MONTH(GETDATE())
        AND YEAR(nc.time_period) = YEAR(GETDATE())
    `,
      { user_id: userId }
    )

    // Get previous month cost for growth calculation
    const previousMonthResult = await database.query(
      `
      SELECT ISNULL(SUM(nc.cost_amount), 0) as previous_cost
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      WHERE cu.user_id = @user_id
        AND MONTH(nc.time_period) = MONTH(DATEADD(MONTH, -1, GETDATE()))
        AND YEAR(nc.time_period) = YEAR(DATEADD(MONTH, -1, GETDATE()))
    `,
      { user_id: userId }
    )

    const currentCost = totalCostResult.recordset[0].total_cost
    const previousCost = previousMonthResult.recordset[0].previous_cost
    const monthlyGrowth =
      previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0

    res.json({
      success: true,
      data: {
        totalCost: currentCost,
        servicesCount: totalCostResult.recordset[0].services_count,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      },
    })
  } catch (error) {
    console.error("Dashboard summary error:", error)
    res.status(500).json({ message: "Failed to get dashboard summary" })
  }
})

// Get top services by cost
router.get("/top-services", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit as string) || 10

    const result = await database.query(
      `
      SELECT TOP (@limit)
        nc.service_name,
        SUM(nc.cost_amount) as total_cost,
        COUNT(*) as record_count
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      WHERE cu.user_id = @user_id
        AND MONTH(nc.time_period) = MONTH(GETDATE())
        AND YEAR(nc.time_period) = YEAR(GETDATE())
      GROUP BY nc.service_name
      ORDER BY total_cost DESC
    `,
      {
        user_id: userId,
        limit,
      }
    )

    // Calculate percentages
    const totalCost = result.recordset.reduce(
      (sum, item) => sum + item.total_cost,
      0
    )
    const services = result.recordset.map((item) => ({
      name: item.service_name,
      cost: item.total_cost,
      percentage:
        totalCost > 0 ? Math.round((item.total_cost / totalCost) * 100) : 0,
      recordCount: item.record_count,
    }))

    res.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error("Top services error:", error)
    res.status(500).json({ message: "Failed to get top services" })
  }
})

// Get monthly cost trends
router.get("/trends", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id
    const months = parseInt(req.query.months as string) || 6

    const result = await database.query(
      `
      SELECT 
        FORMAT(nc.time_period, 'MMM') as month,
        YEAR(nc.time_period) as year,
        SUM(nc.cost_amount) as total_cost
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      WHERE cu.user_id = @user_id
        AND nc.time_period >= DATEADD(MONTH, -@months, GETDATE())
      GROUP BY YEAR(nc.time_period), MONTH(nc.time_period), FORMAT(nc.time_period, 'MMM')
      ORDER BY YEAR(nc.time_period), MONTH(nc.time_period)
    `,
      {
        user_id: userId,
        months,
      }
    )

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Trends error:", error)
    res.status(500).json({ message: "Failed to get cost trends" })
  }
})

// Get cost breakdown by category
router.get("/categories", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id

    const result = await database.query(
      `
      SELECT 
        nc.category,
        SUM(nc.cost_amount) as total_cost,
        COUNT(*) as record_count
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      WHERE cu.user_id = @user_id
        AND MONTH(nc.time_period) = MONTH(GETDATE())
        AND YEAR(nc.time_period) = YEAR(GETDATE())
      GROUP BY nc.category
      ORDER BY total_cost DESC
    `,
      { user_id: userId }
    )

    // Calculate percentages
    const totalCost = result.recordset.reduce(
      (sum, item) => sum + item.total_cost,
      0
    )
    const categories = result.recordset.map((item) => ({
      category: item.category || "Unknown",
      cost: item.total_cost,
      percentage:
        totalCost > 0 ? Math.round((item.total_cost / totalCost) * 100) : 0,
      recordCount: item.record_count,
    }))

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Categories error:", error)
    res.status(500).json({ message: "Failed to get category breakdown" })
  }
})

// Get cost data with filters
router.get("/costs", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id
    const {
      startDate,
      endDate,
      service,
      category,
      limit = 100,
      offset = 0,
    } = req.query

    let whereClause = "WHERE cu.user_id = @user_id"
    const params: any = { user_id: userId }

    if (startDate) {
      whereClause += " AND nc.time_period >= @start_date"
      params.start_date = startDate
    }

    if (endDate) {
      whereClause += " AND nc.time_period <= @end_date"
      params.end_date = endDate
    }

    if (service) {
      whereClause += " AND nc.service_name = @service"
      params.service = service
    }

    if (category) {
      whereClause += " AND nc.category = @category"
      params.category = category
    }

    const query = `
      SELECT 
        nc.service_name,
        nc.cost_amount,
        nc.currency,
        nc.time_period,
        nc.category,
        nc.sub_category,
        nc.region,
        nc.resource_id
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      ${whereClause}
      ORDER BY nc.time_period DESC, nc.cost_amount DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `

    const result = await database.query(query, {
      ...params,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      ${whereClause}
    `

    const countResult = await database.query(countQuery, params)

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    })
  } catch (error) {
    console.error("Get costs error:", error)
    res.status(500).json({ message: "Failed to get cost data" })
  }
})

// Export cost data as CSV
router.get("/export/csv", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id
    const { startDate, endDate, service, category } = req.query

    let whereClause = "WHERE cu.user_id = @user_id"
    const params: any = { user_id: userId }

    if (startDate) {
      whereClause += " AND nc.time_period >= @start_date"
      params.start_date = startDate
    }

    if (endDate) {
      whereClause += " AND nc.time_period <= @end_date"
      params.end_date = endDate
    }

    if (service) {
      whereClause += " AND nc.service_name = @service"
      params.service = service
    }

    if (category) {
      whereClause += " AND nc.category = @category"
      params.category = category
    }

    const result = await database.query(
      `
      SELECT 
        nc.service_name as 'Service Name',
        nc.cost_amount as 'Cost Amount',
        nc.currency as 'Currency',
        FORMAT(nc.time_period, 'yyyy-MM-dd') as 'Date',
        nc.category as 'Category',
        nc.sub_category as 'Sub Category',
        nc.region as 'Region',
        nc.resource_id as 'Resource ID'
      FROM NormalizedCost nc
      INNER JOIN CostUploads cu ON nc.upload_id = cu.id
      ${whereClause}
      ORDER BY nc.time_period DESC
    `,
      params
    )

    // Generate CSV
    const headers = Object.keys(result.recordset[0] || {})
    const csvRows = [
      headers.join(","),
      ...result.recordset.map((row) =>
        headers.map((field) => JSON.stringify(row[field])).join(",")
      ),
    ]

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=cost-export.csv")
    res.send(csvRows.join("\n"))
  } catch (error) {
    console.error("CSV export error:", error)
    res.status(500).json({ message: "Failed to export CSV" })
  }
})

export default router
