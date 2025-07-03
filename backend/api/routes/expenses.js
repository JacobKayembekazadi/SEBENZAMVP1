const express = require('express');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Expense statuses
const expenseStatuses = ['draft', 'submitted', 'approved', 'reimbursed', 'rejected'];

// Common expense categories
const expenseCategories = [
  'Travel', 'Meals', 'Office Supplies', 'Technology', 'Legal Research',
  'Court Fees', 'Professional Services', 'Marketing', 'Training', 'Other'
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// GET /api/expenses - Get all expenses
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('search').optional().trim(),
  expressQuery('status').optional().isIn(expenseStatuses),
  expressQuery('category').optional().isIn(expenseCategories),
  expressQuery('clientId').optional().isUUID(),
  expressQuery('caseId').optional().isUUID(),
  expressQuery('createdBy').optional().isUUID(),
  expressQuery('isBillable').optional().isBoolean(),
  expressQuery('startDate').optional().isISO8601(),
  expressQuery('endDate').optional().isISO8601(),
  expressQuery('sortBy').optional().isIn(['title', 'amount', 'date', 'category', 'status', 'createdAt']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      clientId,
      caseId,
      createdBy,
      isBillable,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Base query with joins
    let baseQuery = `
      SELECT 
        e.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM expenses e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN clients cl ON e.client_id = cl.id
      JOIN users u ON e.created_by = u.id
    `;

    // Build filters
    const filters = {};
    if (status) filters['e.status'] = status;
    if (category) filters['e.category'] = category;
    if (clientId) filters['e.client_id'] = clientId;
    if (caseId) filters['e.case_id'] = caseId;
    if (createdBy) filters['e.created_by'] = createdBy;
    if (isBillable !== undefined) filters['e.is_billable'] = isBillable;

    // Build search conditions
    let searchConditions = '';
    let searchValues = [];
    if (search) {
      const searchIndex = Object.keys(filters).length + 1;
      searchConditions = `AND (
        e.title ILIKE $${searchIndex} OR
        e.description ILIKE $${searchIndex} OR
        c.title ILIKE $${searchIndex} OR
        cl.first_name ILIKE $${searchIndex} OR
        cl.last_name ILIKE $${searchIndex} OR
        cl.company ILIKE $${searchIndex}
      )`;
      searchValues = [`%${search}%`];
    }

    // Build date range conditions
    let dateConditions = '';
    let dateValues = [];
    const nextParamIndex = Object.keys(filters).length + searchValues.length + 1;
    
    if (startDate && endDate) {
      dateConditions = `AND e.date BETWEEN $${nextParamIndex} AND $${nextParamIndex + 1}`;
      dateValues = [startDate, endDate];
    } else if (startDate) {
      dateConditions = `AND e.date >= $${nextParamIndex}`;
      dateValues = [startDate];
    } else if (endDate) {
      dateConditions = `AND e.date <= $${nextParamIndex}`;
      dateValues = [endDate];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const orderClause = `ORDER BY e.${sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expenses e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN clients cl ON e.client_id = cl.id
      ${whereClause}
      ${searchConditions}
      ${dateConditions}
    `;
    const countResult = await query(countQuery, [...values, ...searchValues, ...dateValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get expenses
    const expensesQuery = `
      ${baseQuery}
      ${whereClause}
      ${searchConditions}
      ${dateConditions}
      ${orderClause}
      ${paginationClause}
    `;
    const expensesResult = await query(expensesQuery, [...values, ...searchValues, ...dateValues]);

    // Transform results
    const expenses = expensesResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date,
      category: row.category,
      clientId: row.client_id,
      client: row.client_first_name ? {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
      } : null,
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      isBillable: row.is_billable,
      status: row.status,
      createdBy: row.created_by,
      creator: {
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
    });
  }
});

// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        e.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email
      FROM expenses e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN clients cl ON e.client_id = cl.id
      JOIN users u ON e.created_by = u.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const row = result.rows[0];
    const expense = {
      id: row.id,
      title: row.title,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date,
      category: row.category,
      clientId: row.client_id,
      client: row.client_first_name ? {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
      } : null,
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      isBillable: row.is_billable,
      status: row.status,
      createdBy: row.created_by,
      creator: {
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
        email: row.creator_email,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    logger.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
    });
  }
});

// POST /api/expenses - Create new expense
router.post('/', [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('category').isIn(expenseCategories).withMessage('Invalid category'),
  body('clientId').optional().isUUID().withMessage('Invalid client ID'),
  body('caseId').optional().isUUID().withMessage('Invalid case ID'),
  body('description').optional().trim(),
  body('isBillable').optional().isBoolean().withMessage('isBillable must be boolean'),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      date,
      category,
      clientId,
      caseId,
      isBillable = false,
    } = req.body;

    const userId = req.user.id;

    // Verify client exists if provided
    if (clientId) {
      const clientResult = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (clientResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Client not found',
        });
      }
    }

    // Verify case exists and belongs to client if provided
    if (caseId) {
      let caseQuery = 'SELECT id FROM cases WHERE id = $1';
      let caseParams = [caseId];
      
      if (clientId) {
        caseQuery += ' AND client_id = $2';
        caseParams.push(clientId);
      }
      
      const caseResult = await query(caseQuery, caseParams);
      if (caseResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: clientId ? 'Case not found or does not belong to this client' : 'Case not found',
        });
      }
    }

    const expenseId = uuidv4();
    
    const result = await query(`
      INSERT INTO expenses (
        id, title, description, amount, date, category, client_id, case_id,
        is_billable, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [
      expenseId,
      title,
      description || null,
      amount,
      date,
      category,
      clientId || null,
      caseId || null,
      isBillable,
      'draft',
      userId,
    ]);

    const row = result.rows[0];
    const expense = {
      id: row.id,
      title: row.title,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date,
      category: row.category,
      clientId: row.client_id,
      caseId: row.case_id,
      isBillable: row.is_billable,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Expense created: ${expense.title} (${expense.id})`);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error) {
    logger.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
    });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('category').optional().isIn(expenseCategories).withMessage('Invalid category'),
  body('description').optional().trim(),
  body('isBillable').optional().isBoolean().withMessage('isBillable must be boolean'),
  body('status').optional().isIn(expenseStatuses).withMessage('Invalid status'),
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Check if expense exists and user has permission to edit
    const existingResult = await query(`
      SELECT e.*, e.created_by = $1 as is_owner, u.role 
      FROM expenses e
      JOIN users u ON $1 = u.id
      WHERE e.id = $2
    `, [userId, id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const existing = existingResult.rows[0];
    const canEdit = existing.is_owner || ['admin', 'attorney'].includes(existing.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only edit your own expenses.',
      });
    }

    // Prevent editing approved expenses
    if (existing.status === 'approved' || existing.status === 'reimbursed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved or reimbursed expenses',
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const fieldMappings = {
      title: 'title',
      description: 'description',
      amount: 'amount',
      date: 'date',
      category: 'category',
      isBillable: 'is_billable',
      status: 'status',
    };

    Object.entries(fieldMappings).forEach(([key, dbField]) => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex++}`);
        updateValues.push(updateData[key]);
      }
    });

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE expenses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const row = result.rows[0];
    
    const expense = {
      id: row.id,
      title: row.title,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date,
      category: row.category,
      clientId: row.client_id,
      caseId: row.case_id,
      isBillable: row.is_billable,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Expense updated: ${expense.title} (${expense.id})`);

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    logger.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if expense exists and user has permission to delete
    const existingResult = await query(`
      SELECT e.*, e.created_by = $1 as is_owner, u.role 
      FROM expenses e
      JOIN users u ON $1 = u.id
      WHERE e.id = $2
    `, [userId, id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const existing = existingResult.rows[0];
    const canDelete = existing.is_owner || ['admin', 'attorney'].includes(existing.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete your own expenses.',
      });
    }

    // Prevent deleting approved expenses
    if (existing.status === 'approved' || existing.status === 'reimbursed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved or reimbursed expenses',
      });
    }

    await query('DELETE FROM expenses WHERE id = $1', [id]);

    logger.info(`Expense deleted: ${existing.title} (${id})`);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
    });
  }
});

// POST /api/expenses/bulk-update - Bulk update expense status
router.post('/bulk-update', [
  body('expenseIds').isArray().withMessage('Expense IDs must be an array'),
  body('expenseIds.*').isUUID().withMessage('Each expense ID must be valid'),
  body('status').isIn(expenseStatuses).withMessage('Invalid status'),
], handleValidationErrors, authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { expenseIds, status } = req.body;

    if (expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No expense IDs provided',
      });
    }

    // Update expenses
    const result = await query(`
      UPDATE expenses 
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2) AND status NOT IN ('reimbursed')
      RETURNING id, title, status
    `, [status, expenseIds]);

    const updatedCount = result.rows.length;

    logger.info(`Bulk updated ${updatedCount} expenses to status: ${status}`);

    res.json({
      success: true,
      message: `${updatedCount} expenses updated successfully`,
      data: {
        updatedCount,
        updatedExpenses: result.rows,
      },
    });
  } catch (error) {
    logger.error('Error bulk updating expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update expenses',
    });
  }
});

// GET /api/expenses/categories - Get expense categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: expenseCategories,
  });
});

module.exports = router; 