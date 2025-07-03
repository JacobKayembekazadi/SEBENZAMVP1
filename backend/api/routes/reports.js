const express = require('express');
const { query, validationResult } = require('express-validator');
const { db } = require('../../lib/database');
const { logger } = require('../../lib/logger');

const router = express.Router();

// Financial summary report
router.get('/financial-summary', [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('clientId').optional().isUUID(),
  query('caseId').optional().isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, clientId, caseId } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Date range filter
    if (startDate) {
      whereConditions.push(`i.issue_date >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`i.issue_date <= $${paramIndex++}`);
      params.push(endDate);
    }

    if (clientId) {
      whereConditions.push(`i.client_id = $${paramIndex++}`);
      params.push(clientId);
    }

    if (caseId) {
      whereConditions.push(`i.case_id = $${paramIndex++}`);
      params.push(caseId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Revenue by status
    const revenueQuery = `
      SELECT 
        i.status,
        COUNT(*) as invoice_count,
        SUM(i.total_amount) as total_revenue,
        SUM(i.paid_amount) as paid_revenue,
        SUM(i.total_amount - i.paid_amount) as outstanding_revenue
      FROM invoices i
      ${whereClause}
      GROUP BY i.status
      ORDER BY total_revenue DESC
    `;

    const revenueResult = await db.query(revenueQuery, params);

    // Time and billing summary
    const timeQuery = `
      SELECT 
        COUNT(te.id) as total_entries,
        SUM(te.duration) as total_hours,
        SUM(CASE WHEN te.billable THEN te.duration ELSE 0 END) as billable_hours,
        SUM(te.amount) as total_amount,
        AVG(te.rate) as average_rate
      FROM time_entries te
      ${whereClause.replace('i.', 'te.')}
    `;

    const timeResult = await db.query(timeQuery, params);

    // Expense summary
    const expenseQuery = `
      SELECT 
        COUNT(e.id) as total_expenses,
        SUM(e.amount) as total_amount,
        SUM(CASE WHEN e.billable THEN e.amount ELSE 0 END) as billable_amount,
        e.category,
        COUNT(*) as count_by_category
      FROM expenses e
      ${whereClause.replace('i.', 'e.')}
      GROUP BY e.category
      ORDER BY total_amount DESC
    `;

    const expenseResult = await db.query(expenseQuery, params);

    res.json({
      success: true,
      data: {
        revenue: revenueResult.rows,
        timeTracking: timeResult.rows[0] || {},
        expenses: expenseResult.rows
      }
    });

  } catch (error) {
    logger.error('Error generating financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial summary'
    });
  }
});

// Case performance report
router.get('/case-performance', [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('practiceArea').optional(),
  query('status').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, practiceArea, status } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`c.opened_date >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`c.opened_date <= $${paramIndex++}`);
      params.push(endDate);
    }

    if (practiceArea) {
      whereConditions.push(`c.practice_area = $${paramIndex++}`);
      params.push(practiceArea);
    }

    if (status) {
      whereConditions.push(`c.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        c.id,
        c.title,
        c.case_number,
        c.practice_area,
        c.status,
        c.priority,
        c.opened_date,
        c.closed_date,
        c.budget,
        c.estimated_hours,
        c.actual_hours,
        cl.first_name || ' ' || cl.last_name as client_name,
        COALESCE(SUM(te.duration), 0) as total_time_logged,
        COALESCE(SUM(te.amount), 0) as total_revenue,
        COALESCE(SUM(e.amount), 0) as total_expenses,
        COUNT(DISTINCT te.id) as time_entries_count,
        COUNT(DISTINCT e.id) as expenses_count,
        COUNT(DISTINCT i.id) as invoices_count
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN time_entries te ON c.id = te.case_id
      LEFT JOIN expenses e ON c.id = e.case_id
      LEFT JOIN invoices i ON c.id = i.case_id
      ${whereClause}
      GROUP BY c.id, cl.first_name, cl.last_name
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(query, params);

    const cases = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      caseNumber: row.case_number,
      practiceArea: row.practice_area,
      status: row.status,
      priority: row.priority,
      openedDate: row.opened_date,
      closedDate: row.closed_date,
      budget: row.budget,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      clientName: row.client_name,
      totalTimeLogged: parseFloat(row.total_time_logged) || 0,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      totalExpenses: parseFloat(row.total_expenses) || 0,
      timeEntriesCount: parseInt(row.time_entries_count) || 0,
      expensesCount: parseInt(row.expenses_count) || 0,
      invoicesCount: parseInt(row.invoices_count) || 0,
      profitability: (parseFloat(row.total_revenue) || 0) - (parseFloat(row.total_expenses) || 0)
    }));

    res.json({
      success: true,
      data: cases
    });

  } catch (error) {
    logger.error('Error generating case performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate case performance report'
    });
  }
});

// Staff utilization report
router.get('/staff-utilization', [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('userId').optional().isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, userId } = req.query;

    let whereConditions = ['te.date IS NOT NULL'];
    let params = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`te.date >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`te.date <= $${paramIndex++}`);
      params.push(endDate);
    }

    if (userId) {
      whereConditions.push(`u.id = $${paramIndex++}`);
      params.push(userId);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        u.role,
        u.hourly_rate,
        COUNT(te.id) as total_entries,
        SUM(te.duration) as total_hours,
        SUM(CASE WHEN te.billable THEN te.duration ELSE 0 END) as billable_hours,
        SUM(te.amount) as total_revenue,
        AVG(te.rate) as average_rate,
        COUNT(DISTINCT te.case_id) as cases_worked_on,
        MIN(te.date) as first_entry_date,
        MAX(te.date) as last_entry_date
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.role, u.hourly_rate
      HAVING COUNT(te.id) > 0
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(query, params);

    const staffUtilization = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      hourlyRate: row.hourly_rate,
      totalEntries: parseInt(row.total_entries) || 0,
      totalHours: parseFloat(row.total_hours) || 0,
      billableHours: parseFloat(row.billable_hours) || 0,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      averageRate: parseFloat(row.average_rate) || 0,
      casesWorkedOn: parseInt(row.cases_worked_on) || 0,
      firstEntryDate: row.first_entry_date,
      lastEntryDate: row.last_entry_date,
      billablePercentage: row.total_hours > 0 ? 
        (parseFloat(row.billable_hours) / parseFloat(row.total_hours)) * 100 : 0
    }));

    res.json({
      success: true,
      data: staffUtilization
    });

  } catch (error) {
    logger.error('Error generating staff utilization report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate staff utilization report'
    });
  }
});

// Client analytics report
router.get('/client-analytics', [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('status').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, status } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`c.created_at >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`c.created_at <= $${paramIndex++}`);
      params.push(endDate);
    }

    if (status) {
      whereConditions.push(`c.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        c.id,
        c.first_name || ' ' || c.last_name as name,
        c.email,
        c.company,
        c.status,
        c.created_at,
        COUNT(DISTINCT ca.id) as total_cases,
        COUNT(DISTINCT CASE WHEN ca.status = 'active' THEN ca.id END) as active_cases,
        COUNT(DISTINCT CASE WHEN ca.status = 'closed' THEN ca.id END) as closed_cases,
        COALESCE(SUM(te.amount), 0) as total_revenue,
        COALESCE(SUM(e.amount), 0) as total_expenses,
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_invoiced,
        COALESCE(SUM(i.paid_amount), 0) as total_paid,
        COALESCE(SUM(i.total_amount - i.paid_amount), 0) as outstanding_balance
      FROM clients c
      LEFT JOIN cases ca ON c.id = ca.client_id
      LEFT JOIN time_entries te ON ca.id = te.case_id
      LEFT JOIN expenses e ON ca.id = e.case_id
      LEFT JOIN invoices i ON c.id = i.client_id
      ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.company, c.status, c.created_at
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(query, params);

    const clientAnalytics = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      status: row.status,
      createdAt: row.created_at,
      totalCases: parseInt(row.total_cases) || 0,
      activeCases: parseInt(row.active_cases) || 0,
      closedCases: parseInt(row.closed_cases) || 0,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      totalExpenses: parseFloat(row.total_expenses) || 0,
      totalInvoices: parseInt(row.total_invoices) || 0,
      totalInvoiced: parseFloat(row.total_invoiced) || 0,
      totalPaid: parseFloat(row.total_paid) || 0,
      outstandingBalance: parseFloat(row.outstanding_balance) || 0,
      profitability: (parseFloat(row.total_revenue) || 0) - (parseFloat(row.total_expenses) || 0)
    }));

    res.json({
      success: true,
      data: clientAnalytics
    });

  } catch (error) {
    logger.error('Error generating client analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate client analytics report'
    });
  }
});

// Dashboard metrics
router.get('/dashboard-metrics', async (req, res) => {
  try {
    // Get current date for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total counts
    const countsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
        (SELECT COUNT(*) FROM cases WHERE status = 'active') as active_cases,
        (SELECT COUNT(*) FROM invoices WHERE status IN ('sent', 'overdue')) as pending_invoices,
        (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE status IN ('sent', 'overdue')) as outstanding_revenue
    `;

    const countsResult = await db.query(countsQuery);

    // Monthly revenue
    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM(paid_amount), 0) as monthly_revenue
      FROM invoices 
      WHERE paid_amount > 0 AND updated_at >= $1
    `;

    const monthlyRevenueResult = await db.query(monthlyRevenueQuery, [startOfMonth]);

    // Yearly revenue
    const yearlyRevenueQuery = `
      SELECT COALESCE(SUM(paid_amount), 0) as yearly_revenue
      FROM invoices 
      WHERE paid_amount > 0 AND updated_at >= $1
    `;

    const yearlyRevenueResult = await db.query(yearlyRevenueQuery, [startOfYear]);

    // Recent activity
    const recentActivityQuery = `
      SELECT 
        'case' as type,
        c.title as title,
        c.created_at as date,
        cl.first_name || ' ' || cl.last_name as client_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'invoice' as type,
        'Invoice #' || i.invoice_number as title,
        i.created_at as date,
        cl.first_name || ' ' || cl.last_name as client_name
      FROM invoices i
      LEFT JOIN clients cl ON i.client_id = cl.id
      WHERE i.created_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY date DESC
      LIMIT 10
    `;

    const recentActivityResult = await db.query(recentActivityQuery);

    res.json({
      success: true,
      data: {
        totals: {
          activeClients: parseInt(countsResult.rows[0].active_clients) || 0,
          activeCases: parseInt(countsResult.rows[0].active_cases) || 0,
          pendingInvoices: parseInt(countsResult.rows[0].pending_invoices) || 0,
          outstandingRevenue: parseFloat(countsResult.rows[0].outstanding_revenue) || 0
        },
        revenue: {
          monthly: parseFloat(monthlyRevenueResult.rows[0].monthly_revenue) || 0,
          yearly: parseFloat(yearlyRevenueResult.rows[0].yearly_revenue) || 0
        },
        recentActivity: recentActivityResult.rows.map(row => ({
          type: row.type,
          title: row.title,
          date: row.date,
          clientName: row.client_name
        }))
      }
    });

  } catch (error) {
    logger.error('Error generating dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard metrics'
    });
  }
});

module.exports = router; 