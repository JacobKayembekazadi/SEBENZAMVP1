const express = require('express');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, transaction, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Practice areas enum
const practiceAreas = [
  'Corporate', 'Litigation', 'Estate', 'IP', 'Contracts', 
  'Family', 'Criminal', 'Immigration', 'Real Estate', 'Tax'
];

// Case statuses and priorities
const caseStatuses = ['active', 'pending', 'closed', 'on_hold'];
const casePriorities = ['low', 'medium', 'high', 'urgent'];

// Validation rules
const createCaseValidation = [
  body('title').notEmpty().trim().withMessage('Case title is required'),
  body('clientId').isUUID().withMessage('Valid client ID is required'),
  body('practiceArea').isIn(practiceAreas).withMessage('Valid practice area is required'),
  body('status').optional().isIn(caseStatuses).withMessage('Invalid status'),
  body('priority').optional().isIn(casePriorities).withMessage('Invalid priority'),
  body('caseNumber').optional().trim(),
  body('openedDate').optional().isISO8601().withMessage('Valid date is required'),
  body('closedDate').optional().isISO8601().withMessage('Valid date is required'),
  body('assignedAttorneys').optional().isArray().withMessage('Assigned attorneys must be an array'),
  body('assignedAttorneys.*').optional().isUUID().withMessage('Each attorney ID must be valid'),
  body('opposingCounsel').optional().trim(),
  body('courtInfo.courtName').optional().trim(),
  body('courtInfo.judgeAssigned').optional().trim(),
  body('courtInfo.caseNumber').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be positive'),
  body('description').optional().trim(),
  body('notes').optional().trim(),
];

const updateCaseValidation = [
  body('title').optional().notEmpty().trim().withMessage('Case title cannot be empty'),
  body('practiceArea').optional().isIn(practiceAreas).withMessage('Valid practice area is required'),
  body('status').optional().isIn(caseStatuses).withMessage('Invalid status'),
  body('priority').optional().isIn(casePriorities).withMessage('Invalid priority'),
  body('caseNumber').optional().trim(),
  body('openedDate').optional().isISO8601().withMessage('Valid date is required'),
  body('closedDate').optional().isISO8601().withMessage('Valid date is required'),
  body('assignedAttorneys').optional().isArray().withMessage('Assigned attorneys must be an array'),
  body('assignedAttorneys.*').optional().isUUID().withMessage('Each attorney ID must be valid'),
  body('opposingCounsel').optional().trim(),
  body('courtInfo.courtName').optional().trim(),
  body('courtInfo.judgeAssigned').optional().trim(),
  body('courtInfo.caseNumber').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be positive'),
  body('description').optional().trim(),
  body('notes').optional().trim(),
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

// GET /api/cases - Get all cases with filtering, search, and pagination
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('search').optional().trim(),
  expressQuery('status').optional().isIn(caseStatuses),
  expressQuery('practiceArea').optional().isIn(practiceAreas),
  expressQuery('priority').optional().isIn(casePriorities),
  expressQuery('clientId').optional().isUUID(),
  expressQuery('assignedTo').optional().isUUID(),
  expressQuery('sortBy').optional().isIn(['title', 'caseNumber', 'practiceArea', 'status', 'priority', 'openedDate', 'createdAt']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      practiceArea,
      priority,
      clientId,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Base query with joins for additional data
    let baseQuery = `
      SELECT 
        c.*,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company,
        COUNT(DISTINCT te.id) as time_entry_count,
        COALESCE(SUM(te.duration), 0) as total_hours,
        COUNT(DISTINCT d.id) as document_count
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN time_entries te ON c.id = te.case_id
      LEFT JOIN documents d ON c.id = d.case_id
    `;

    // Build filters
    const filters = {};
    if (status) filters['c.status'] = status;
    if (practiceArea) filters['c.practice_area'] = practiceArea;
    if (priority) filters['c.priority'] = priority;
    if (clientId) filters['c.client_id'] = clientId;

    // Build search conditions
    let searchConditions = '';
    let searchValues = [];
    if (search) {
      const searchIndex = Object.keys(filters).length + 1;
      searchConditions = `AND (
        c.title ILIKE $${searchIndex} OR
        c.case_number ILIKE $${searchIndex} OR
        c.description ILIKE $${searchIndex} OR
        cl.first_name ILIKE $${searchIndex} OR
        cl.last_name ILIKE $${searchIndex} OR
        cl.company ILIKE $${searchIndex}
      )`;
      searchValues = [`%${search}%`];
    }

    // Build assigned attorney filter
    let assignedConditions = '';
    let assignedValues = [];
    if (assignedTo) {
      const assignedIndex = Object.keys(filters).length + searchValues.length + 1;
      assignedConditions = `AND EXISTS (
        SELECT 1 FROM case_assignments ca 
        WHERE ca.case_id = c.id AND ca.user_id = $${assignedIndex}
      )`;
      assignedValues = [assignedTo];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const groupClause = 'GROUP BY c.id, cl.first_name, cl.last_name, cl.company';
    const orderClause = `ORDER BY c.${sortBy === 'createdAt' ? 'created_at' : sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ${whereClause}
      ${searchConditions}
      ${assignedConditions}
    `;
    const countResult = await query(countQuery, [...values, ...searchValues, ...assignedValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get cases
    const casesQuery = `
      ${baseQuery}
      ${whereClause}
      ${searchConditions}
      ${assignedConditions}
      ${groupClause}
      ${orderClause}
      ${paginationClause}
    `;
    const casesResult = await query(casesQuery, [...values, ...searchValues, ...assignedValues]);

    // Get case assignments for each case
    const caseIds = casesResult.rows.map(row => row.id);
    let assignments = [];
    if (caseIds.length > 0) {
      const assignmentsQuery = `
        SELECT 
          ca.case_id,
          ca.user_id,
          ca.role,
          u.first_name,
          u.last_name,
          u.email
        FROM case_assignments ca
        JOIN users u ON ca.user_id = u.id
        WHERE ca.case_id = ANY($1)
      `;
      const assignmentsResult = await query(assignmentsQuery, [caseIds]);
      assignments = assignmentsResult.rows;
    }

    // Transform results
    const cases = casesResult.rows.map(row => {
      const caseAssignments = assignments.filter(a => a.case_id === row.id);
      
      return {
        id: row.id,
        title: row.title,
        caseNumber: row.case_number,
        clientId: row.client_id,
        client: {
          firstName: row.client_first_name,
          lastName: row.client_last_name,
          company: row.client_company,
        },
        practiceArea: row.practice_area,
        status: row.status,
        priority: row.priority,
        openedDate: row.opened_date,
        closedDate: row.closed_date,
        opposingCounsel: row.opposing_counsel,
        courtInfo: row.court_info,
        budget: row.budget ? parseFloat(row.budget) : null,
        estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
        actualHours: parseFloat(row.total_hours),
        description: row.description,
        notes: row.notes,
        timeEntryCount: parseInt(row.time_entry_count),
        documentCount: parseInt(row.document_count),
        assignedAttorneys: caseAssignments.map(a => ({
          id: a.user_id,
          firstName: a.first_name,
          lastName: a.last_name,
          email: a.email,
          role: a.role,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching cases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cases',
    });
  }
});

// GET /api/cases/:id - Get single case
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        c.*,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.email as client_email,
        cl.phone as client_phone,
        cl.company as client_company,
        COUNT(DISTINCT te.id) as time_entry_count,
        COALESCE(SUM(te.duration), 0) as total_hours,
        COUNT(DISTINCT d.id) as document_count,
        COUNT(DISTINCT i.id) as invoice_count
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN time_entries te ON c.id = te.case_id
      LEFT JOIN documents d ON c.id = d.case_id
      LEFT JOIN invoices i ON c.id = i.case_id
      WHERE c.id = $1
      GROUP BY c.id, cl.first_name, cl.last_name, cl.email, cl.phone, cl.company
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // Get case assignments
    const assignmentsResult = await query(`
      SELECT 
        ca.user_id,
        ca.role,
        u.first_name,
        u.last_name,
        u.email,
        u.role as user_role
      FROM case_assignments ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.case_id = $1
    `, [id]);

    const row = result.rows[0];
    const case_ = {
      id: row.id,
      title: row.title,
      caseNumber: row.case_number,
      clientId: row.client_id,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        email: row.client_email,
        phone: row.client_phone,
        company: row.client_company,
      },
      practiceArea: row.practice_area,
      status: row.status,
      priority: row.priority,
      openedDate: row.opened_date,
      closedDate: row.closed_date,
      opposingCounsel: row.opposing_counsel,
      courtInfo: row.court_info,
      budget: row.budget ? parseFloat(row.budget) : null,
      estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
      actualHours: parseFloat(row.total_hours),
      description: row.description,
      notes: row.notes,
      timeEntryCount: parseInt(row.time_entry_count),
      documentCount: parseInt(row.document_count),
      invoiceCount: parseInt(row.invoice_count),
      assignedAttorneys: assignmentsResult.rows.map(a => ({
        id: a.user_id,
        firstName: a.first_name,
        lastName: a.last_name,
        email: a.email,
        role: a.role,
        userRole: a.user_role,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: case_,
    });
  } catch (error) {
    logger.error('Error fetching case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case',
    });
  }
});

// POST /api/cases - Create new case
router.post('/', createCaseValidation, handleValidationErrors, authorize('admin', 'attorney'), async (req, res) => {
  try {
    const {
      title,
      clientId,
      practiceArea,
      status = 'pending',
      priority = 'medium',
      caseNumber,
      openedDate = new Date(),
      closedDate,
      assignedAttorneys = [],
      opposingCounsel,
      courtInfo,
      budget,
      estimatedHours,
      description,
      notes,
    } = req.body;

    // Verify client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Verify assigned attorneys exist
    if (assignedAttorneys.length > 0) {
      const attorneyResult = await query(
        'SELECT id FROM users WHERE id = ANY($1) AND role IN ($2, $3)',
        [assignedAttorneys, 'attorney', 'admin']
      );
      if (attorneyResult.rows.length !== assignedAttorneys.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned attorneys not found or invalid',
        });
      }
    }

    const caseId = uuidv4();

    await transaction(async (client) => {
      // Create case
      const result = await client.query(`
        INSERT INTO cases (
          id, title, case_number, client_id, practice_area, status, priority,
          opened_date, closed_date, opposing_counsel, court_info, budget,
          estimated_hours, description, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING *
      `, [
        caseId,
        title,
        caseNumber || null,
        clientId,
        practiceArea,
        status,
        priority,
        openedDate,
        closedDate || null,
        opposingCounsel || null,
        courtInfo ? JSON.stringify(courtInfo) : null,
        budget || null,
        estimatedHours || null,
        description || null,
        notes || null,
      ]);

      // Create case assignments
      if (assignedAttorneys.length > 0) {
        const assignmentValues = assignedAttorneys.map((attorneyId, index) => 
          `($${1 + index * 3}, $${2 + index * 3}, $${3 + index * 3})`
        ).join(', ');
        
        const assignmentParams = [];
        assignedAttorneys.forEach(attorneyId => {
          assignmentParams.push(uuidv4(), caseId, attorneyId);
        });

        await client.query(`
          INSERT INTO case_assignments (id, case_id, user_id, role)
          VALUES ${assignmentValues}
        `, assignmentParams);
      }

      return result.rows[0];
    });

    // Get the created case with full details
    const caseResult = await query(`
      SELECT 
        c.*,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1
    `, [caseId]);

    const row = caseResult.rows[0];
    const case_ = {
      id: row.id,
      title: row.title,
      caseNumber: row.case_number,
      clientId: row.client_id,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
      },
      practiceArea: row.practice_area,
      status: row.status,
      priority: row.priority,
      openedDate: row.opened_date,
      closedDate: row.closed_date,
      opposingCounsel: row.opposing_counsel,
      courtInfo: row.court_info,
      budget: row.budget ? parseFloat(row.budget) : null,
      estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
      actualHours: 0,
      description: row.description,
      notes: row.notes,
      assignedAttorneys,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Case created: ${case_.title} (${case_.id})`);

    res.status(201).json({
      success: true,
      data: case_,
      message: 'Case created successfully',
    });
  } catch (error) {
    logger.error('Error creating case:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Case number already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create case',
    });
  }
});

// PUT /api/cases/:id - Update case
router.put('/:id', updateCaseValidation, handleValidationErrors, authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if case exists
    const existingCase = await query('SELECT id FROM cases WHERE id = $1', [id]);
    if (existingCase.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // Verify assigned attorneys if provided
    if (updateData.assignedAttorneys && updateData.assignedAttorneys.length > 0) {
      const attorneyResult = await query(
        'SELECT id FROM users WHERE id = ANY($1) AND role IN ($2, $3)',
        [updateData.assignedAttorneys, 'attorney', 'admin']
      );
      if (attorneyResult.rows.length !== updateData.assignedAttorneys.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned attorneys not found or invalid',
        });
      }
    }

    await transaction(async (client) => {
      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const fieldMappings = {
        title: 'title',
        practiceArea: 'practice_area',
        status: 'status',
        priority: 'priority',
        caseNumber: 'case_number',
        openedDate: 'opened_date',
        closedDate: 'closed_date',
        opposingCounsel: 'opposing_counsel',
        courtInfo: 'court_info',
        budget: 'budget',
        estimatedHours: 'estimated_hours',
        description: 'description',
        notes: 'notes',
      };

      Object.entries(fieldMappings).forEach(([key, dbField]) => {
        if (updateData[key] !== undefined) {
          updateFields.push(`${dbField} = $${paramIndex++}`);
          if (key === 'courtInfo') {
            updateValues.push(updateData[key] ? JSON.stringify(updateData[key]) : null);
          } else {
            updateValues.push(updateData[key]);
          }
        }
      });

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id);

      // Update case
      if (updateFields.length > 1) { // More than just updated_at
        const updateQuery = `
          UPDATE cases 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        await client.query(updateQuery, updateValues);
      }

      // Update case assignments if provided
      if (updateData.assignedAttorneys !== undefined) {
        // Delete existing assignments
        await client.query('DELETE FROM case_assignments WHERE case_id = $1', [id]);
        
        // Create new assignments
        if (updateData.assignedAttorneys.length > 0) {
          const assignmentValues = updateData.assignedAttorneys.map((attorneyId, index) => 
            `($${1 + index * 3}, $${2 + index * 3}, $${3 + index * 3})`
          ).join(', ');
          
          const assignmentParams = [];
          updateData.assignedAttorneys.forEach(attorneyId => {
            assignmentParams.push(uuidv4(), id, attorneyId);
          });

          await client.query(`
            INSERT INTO case_assignments (id, case_id, user_id, role)
            VALUES ${assignmentValues}
          `, assignmentParams);
        }
      }
    });

    // Get updated case
    const result = await query(`
      SELECT 
        c.*,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1
    `, [id]);

    const row = result.rows[0];
    const case_ = {
      id: row.id,
      title: row.title,
      caseNumber: row.case_number,
      clientId: row.client_id,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
      },
      practiceArea: row.practice_area,
      status: row.status,
      priority: row.priority,
      openedDate: row.opened_date,
      closedDate: row.closed_date,
      opposingCounsel: row.opposing_counsel,
      courtInfo: row.court_info,
      budget: row.budget ? parseFloat(row.budget) : null,
      estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
      actualHours: 0,
      description: row.description,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Case updated: ${case_.title} (${case_.id})`);

    res.json({
      success: true,
      data: case_,
      message: 'Case updated successfully',
    });
  } catch (error) {
    logger.error('Error updating case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case',
    });
  }
});

// DELETE /api/cases/:id - Delete case
router.delete('/:id', authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if case has time entries or documents
    const dependenciesResult = await query(`
      SELECT 
        COUNT(DISTINCT te.id) as time_entries,
        COUNT(DISTINCT d.id) as documents,
        COUNT(DISTINCT i.id) as invoices
      FROM cases c
      LEFT JOIN time_entries te ON c.id = te.case_id
      LEFT JOIN documents d ON c.id = d.case_id
      LEFT JOIN invoices i ON c.id = i.case_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (dependenciesResult.rows.length > 0) {
      const deps = dependenciesResult.rows[0];
      const timeEntries = parseInt(deps.time_entries);
      const documents = parseInt(deps.documents);
      const invoices = parseInt(deps.invoices);

      if (timeEntries > 0 || documents > 0 || invoices > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete case. Case has ${timeEntries} time entries, ${documents} documents, and ${invoices} invoices.`,
        });
      }
    }

    await transaction(async (client) => {
      // Delete case assignments first
      await client.query('DELETE FROM case_assignments WHERE case_id = $1', [id]);
      
      // Delete the case
      const result = await client.query('DELETE FROM cases WHERE id = $1 RETURNING title', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Case not found');
      }

      return result.rows[0];
    });

    logger.info(`Case deleted: ${id}`);

    res.json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting case:', error);
    
    if (error.message === 'Case not found') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete case',
    });
  }
});

// GET /api/cases/:id/time-entries - Get case time entries
router.get('/:id/time-entries', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        te.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.case_id = $1
      ORDER BY te.date DESC, te.start_time DESC
    `, [id]);

    const timeEntries = result.rows.map(row => ({
      id: row.id,
      caseId: row.case_id,
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
      data: timeEntries,
    });
  } catch (error) {
    logger.error('Error fetching case time entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case time entries',
    });
  }
});

module.exports = router; 