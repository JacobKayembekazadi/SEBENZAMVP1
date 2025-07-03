const express = require('express');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, transaction, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Time entry statuses
const timeEntryStatuses = ['draft', 'submitted', 'approved', 'billed'];

// Validation rules
const createTimeEntryValidation = [
  body('caseId').isUUID().withMessage('Valid case ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').isFloat({ min: 0.1 }).withMessage('Duration must be at least 0.1 hours'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('billable').optional().isBoolean().withMessage('Billable must be a boolean'),
  body('rate').optional().isFloat({ min: 0 }).withMessage('Rate must be positive'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
];

const updateTimeEntryValidation = [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('duration').optional().isFloat({ min: 0.1 }).withMessage('Duration must be at least 0.1 hours'),
  body('description').optional().notEmpty().trim().withMessage('Description cannot be empty'),
  body('billable').optional().isBoolean().withMessage('Billable must be a boolean'),
  body('rate').optional().isFloat({ min: 0 }).withMessage('Rate must be positive'),
  body('status').optional().isIn(timeEntryStatuses).withMessage('Invalid status'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
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

// Helper function to calculate amount
const calculateAmount = (duration, rate) => {
  if (!duration || !rate) return null;
  return parseFloat((duration * rate).toFixed(2));
};

// GET /api/time-entries - Get all time entries
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('caseId').optional().isUUID(),
  expressQuery('userId').optional().isUUID(),
  expressQuery('status').optional().isIn(timeEntryStatuses),
  expressQuery('billable').optional().isBoolean(),
  expressQuery('startDate').optional().isISO8601(),
  expressQuery('endDate').optional().isISO8601(),
  expressQuery('sortBy').optional().isIn(['date', 'duration', 'amount', 'createdAt']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      caseId,
      userId,
      status,
      billable,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Base query with joins
    let baseQuery = `
      SELECT 
        te.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM time_entries te
      JOIN cases c ON te.case_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      JOIN users u ON te.user_id = u.id
    `;

    // Build filters
    const filters = {};
    if (caseId) filters['te.case_id'] = caseId;
    if (userId) filters['te.user_id'] = userId;
    if (status) filters['te.status'] = status;
    if (billable !== undefined) filters['te.billable'] = billable;

    // Build date range conditions
    let dateConditions = '';
    let dateValues = [];
    const nextParamIndex = Object.keys(filters).length + 1;
    
    if (startDate && endDate) {
      dateConditions = `AND te.date BETWEEN $${nextParamIndex} AND $${nextParamIndex + 1}`;
      dateValues = [startDate, endDate];
    } else if (startDate) {
      dateConditions = `AND te.date >= $${nextParamIndex}`;
      dateValues = [startDate];
    } else if (endDate) {
      dateConditions = `AND te.date <= $${nextParamIndex}`;
      dateValues = [endDate];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const orderClause = `ORDER BY te.${sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM time_entries te
      JOIN cases c ON te.case_id = c.id
      ${whereClause}
      ${dateConditions}
    `;
    const countResult = await query(countQuery, [...values, ...dateValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get time entries
    const timeEntriesQuery = `
      ${baseQuery}
      ${whereClause}
      ${dateConditions}
      ${orderClause}
      ${paginationClause}
    `;
    const timeEntriesResult = await query(timeEntriesQuery, [...values, ...dateValues]);

    // Transform results
    const timeEntries = timeEntriesResult.rows.map(row => ({
      id: row.id,
      caseId: row.case_id,
      case: {
        title: row.case_title,
        caseNumber: row.case_number,
        client: {
          firstName: row.client_first_name,
          lastName: row.client_last_name,
        },
      },
      userId: row.user_id,
      user: {
        firstName: row.user_first_name,
        lastName: row.user_last_name,
      },
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: parseFloat(row.duration),
      description: row.description,
      billable: row.billable,
      rate: row.rate ? parseFloat(row.rate) : null,
      amount: row.amount ? parseFloat(row.amount) : null,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        timeEntries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching time entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time entries',
    });
  }
});

// GET /api/time-entries/:id - Get single time entry
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        te.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM time_entries te
      JOIN cases c ON te.case_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      JOIN users u ON te.user_id = u.id
      WHERE te.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found',
      });
    }

    const row = result.rows[0];
    const timeEntry = {
      id: row.id,
      caseId: row.case_id,
      case: {
        title: row.case_title,
        caseNumber: row.case_number,
        client: {
          firstName: row.client_first_name,
          lastName: row.client_last_name,
        },
      },
      userId: row.user_id,
      user: {
        firstName: row.user_first_name,
        lastName: row.user_last_name,
        email: row.user_email,
      },
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: parseFloat(row.duration),
      description: row.description,
      billable: row.billable,
      rate: row.rate ? parseFloat(row.rate) : null,
      amount: row.amount ? parseFloat(row.amount) : null,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: timeEntry,
    });
  } catch (error) {
    logger.error('Error fetching time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time entry',
    });
  }
});

// POST /api/time-entries - Create new time entry
router.post('/', createTimeEntryValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      caseId,
      date,
      startTime,
      endTime,
      duration,
      description,
      billable = true,
      rate,
    } = req.body;

    const userId = req.user.id;

    // Verify case exists and user has access
    const caseResult = await query(`
      SELECT c.id, u.hourly_rate 
      FROM cases c
      LEFT JOIN case_assignments ca ON c.id = ca.case_id
      LEFT JOIN users u ON $1 = u.id
      WHERE c.id = $2 AND (ca.user_id = $1 OR u.role IN ('admin', 'attorney'))
    `, [userId, caseId]);

    if (caseResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Case not found or access denied',
      });
    }

    // Use provided rate or user's hourly rate
    const entryRate = rate || caseResult.rows[0].hourly_rate;
    const amount = calculateAmount(duration, entryRate);

    const timeEntryId = uuidv4();
    
    const result = await query(`
      INSERT INTO time_entries (
        id, case_id, user_id, date, start_time, end_time, duration,
        description, billable, rate, amount, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `, [
      timeEntryId,
      caseId,
      userId,
      date,
      startTime || null,
      endTime || null,
      duration,
      description,
      billable,
      entryRate,
      amount,
      'draft',
    ]);

    const row = result.rows[0];
    const timeEntry = {
      id: row.id,
      caseId: row.case_id,
      userId: row.user_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: parseFloat(row.duration),
      description: row.description,
      billable: row.billable,
      rate: row.rate ? parseFloat(row.rate) : null,
      amount: row.amount ? parseFloat(row.amount) : null,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Time entry created: ${timeEntry.id} for case ${caseId}`);

    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Time entry created successfully',
    });
  } catch (error) {
    logger.error('Error creating time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create time entry',
    });
  }
});

// PUT /api/time-entries/:id - Update time entry
router.put('/:id', updateTimeEntryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Check if time entry exists and user has permission to edit
    const existingResult = await query(`
      SELECT te.*, te.user_id = $1 as is_owner, u.role 
      FROM time_entries te
      JOIN users u ON $1 = u.id
      WHERE te.id = $2
    `, [userId, id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found',
      });
    }

    const existing = existingResult.rows[0];
    const canEdit = existing.is_owner || ['admin', 'attorney'].includes(existing.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only edit your own time entries.',
      });
    }

    // Prevent editing billed entries
    if (existing.status === 'billed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit billed time entries',
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const fieldMappings = {
      date: 'date',
      startTime: 'start_time',
      endTime: 'end_time',
      duration: 'duration',
      description: 'description',
      billable: 'billable',
      rate: 'rate',
      status: 'status',
    };

    Object.entries(fieldMappings).forEach(([key, dbField]) => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex++}`);
        updateValues.push(updateData[key]);
      }
    });

    // Recalculate amount if duration or rate changed
    if (updateData.duration !== undefined || updateData.rate !== undefined) {
      const newDuration = updateData.duration !== undefined ? updateData.duration : existing.duration;
      const newRate = updateData.rate !== undefined ? updateData.rate : existing.rate;
      const newAmount = calculateAmount(newDuration, newRate);
      
      if (newAmount !== null) {
        updateFields.push(`amount = $${paramIndex++}`);
        updateValues.push(newAmount);
      }
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE time_entries 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const row = result.rows[0];
    
    const timeEntry = {
      id: row.id,
      caseId: row.case_id,
      userId: row.user_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: parseFloat(row.duration),
      description: row.description,
      billable: row.billable,
      rate: row.rate ? parseFloat(row.rate) : null,
      amount: row.amount ? parseFloat(row.amount) : null,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Time entry updated: ${timeEntry.id}`);

    res.json({
      success: true,
      data: timeEntry,
      message: 'Time entry updated successfully',
    });
  } catch (error) {
    logger.error('Error updating time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time entry',
    });
  }
});

// DELETE /api/time-entries/:id - Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if time entry exists and user has permission to delete
    const existingResult = await query(`
      SELECT te.*, te.user_id = $1 as is_owner, u.role 
      FROM time_entries te
      JOIN users u ON $1 = u.id
      WHERE te.id = $2
    `, [userId, id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found',
      });
    }

    const existing = existingResult.rows[0];
    const canDelete = existing.is_owner || ['admin', 'attorney'].includes(existing.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete your own time entries.',
      });
    }

    // Prevent deleting billed entries
    if (existing.status === 'billed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete billed time entries',
      });
    }

    await query('DELETE FROM time_entries WHERE id = $1', [id]);

    logger.info(`Time entry deleted: ${id}`);

    res.json({
      success: true,
      message: 'Time entry deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time entry',
    });
  }
});

// POST /api/time-entries/bulk-update - Bulk update time entries status
router.post('/bulk-update', [
  body('timeEntryIds').isArray().withMessage('Time entry IDs must be an array'),
  body('timeEntryIds.*').isUUID().withMessage('Each time entry ID must be valid'),
  body('status').isIn(timeEntryStatuses).withMessage('Invalid status'),
], handleValidationErrors, authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { timeEntryIds, status } = req.body;
    const userId = req.user.id;

    if (timeEntryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No time entry IDs provided',
      });
    }

    // Update time entries
    const result = await query(`
      UPDATE time_entries 
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2) AND status != 'billed'
      RETURNING id, case_id, description, status
    `, [status, timeEntryIds]);

    const updatedCount = result.rows.length;

    logger.info(`Bulk updated ${updatedCount} time entries to status: ${status}`);

    res.json({
      success: true,
      message: `${updatedCount} time entries updated successfully`,
      data: {
        updatedCount,
        updatedEntries: result.rows,
      },
    });
  } catch (error) {
    logger.error('Error bulk updating time entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update time entries',
    });
  }
});

module.exports = router; 