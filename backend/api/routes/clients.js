const express = require('express');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, transaction, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createClientValidation = [
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('company').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospective']).withMessage('Invalid status'),
  body('notes').optional().trim(),
];

const updateClientValidation = [
  body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('company').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospective']).withMessage('Invalid status'),
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

// GET /api/clients - Get all clients with filtering, search, and pagination
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('search').optional().trim(),
  expressQuery('status').optional().isIn(['active', 'inactive', 'prospective']),
  expressQuery('sortBy').optional().isIn(['firstName', 'lastName', 'company', 'createdAt', 'status']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build base query
    let baseQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        company,
        address,
        status,
        notes,
        metadata,
        created_at,
        updated_at
      FROM clients
    `;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    
    // Build search conditions
    let searchConditions = '';
    let searchValues = [];
    if (search) {
      searchConditions = `AND (
        first_name ILIKE $${Object.keys(filters).length + 1} OR
        last_name ILIKE $${Object.keys(filters).length + 1} OR
        email ILIKE $${Object.keys(filters).length + 1} OR
        company ILIKE $${Object.keys(filters).length + 1}
      )`;
      searchValues = [`%${search}%`];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM clients
      ${whereClause}
      ${searchConditions}
    `;
    const countResult = await query(countQuery, [...values, ...searchValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get clients
    const clientsQuery = `
      ${baseQuery}
      ${whereClause}
      ${searchConditions}
      ${orderClause}
      ${paginationClause}
    `;
    const clientsResult = await query(clientsQuery, [...values, ...searchValues]);

    // Transform results
    const clients = clientsResult.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      address: row.address,
      status: row.status,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
    });
  }
});

// GET /api/clients/:id - Get single client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT cases.id) as case_count,
        COALESCE(SUM(i.total_amount), 0) as total_billing
      FROM clients c
      LEFT JOIN cases ON c.id = cases.client_id
      LEFT JOIN invoices i ON c.id = i.client_id AND i.status = 'paid'
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const row = result.rows[0];
    const client = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      address: row.address,
      status: row.status,
      notes: row.notes,
      metadata: row.metadata,
      caseCount: parseInt(row.case_count),
      totalBilling: parseFloat(row.total_billing),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
    });
  }
});

// POST /api/clients - Create new client
router.post('/', createClientValidation, handleValidationErrors, authorize('admin', 'attorney', 'paralegal'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      status = 'prospective',
      notes,
    } = req.body;

    const clientId = uuidv4();
    
    const result = await query(`
      INSERT INTO clients (
        id, first_name, last_name, email, phone, company, address, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [
      clientId,
      firstName,
      lastName,
      email || null,
      phone || null,
      company || null,
      address ? JSON.stringify(address) : null,
      status,
      notes || null,
    ]);

    const row = result.rows[0];
    const client = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      address: row.address,
      status: row.status,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Client created: ${client.firstName} ${client.lastName} (${client.id})`);

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully',
    });
  } catch (error) {
    logger.error('Error creating client:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create client',
    });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', updateClientValidation, handleValidationErrors, authorize('admin', 'attorney', 'paralegal'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      status,
      notes,
    } = req.body;

    // Check if client exists
    const existingClient = await query('SELECT id FROM clients WHERE id = $1', [id]);
    if (existingClient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      updateValues.push(lastName);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }
    if (company !== undefined) {
      updateFields.push(`company = $${paramIndex++}`);
      updateValues.push(company);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateValues.push(address ? JSON.stringify(address) : null);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateValues.push(notes);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE clients 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const row = result.rows[0];
    
    const client = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      address: row.address,
      status: row.status,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Client updated: ${client.firstName} ${client.lastName} (${client.id})`);

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully',
    });
  } catch (error) {
    logger.error('Error updating client:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update client',
    });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client has associated cases
    const casesResult = await query('SELECT COUNT(*) as count FROM cases WHERE client_id = $1', [id]);
    const caseCount = parseInt(casesResult.rows[0].count);

    if (caseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete client. Client has ${caseCount} associated case(s).`,
      });
    }

    // Delete the client
    const result = await query('DELETE FROM clients WHERE id = $1 RETURNING first_name, last_name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const deletedClient = result.rows[0];
    logger.info(`Client deleted: ${deletedClient.first_name} ${deletedClient.last_name} (${id})`);

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
    });
  }
});

// GET /api/clients/:id/cases - Get client's cases
router.get('/:id/cases', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const casesResult = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT te.id) as time_entry_count,
        COALESCE(SUM(te.duration), 0) as total_hours
      FROM cases c
      LEFT JOIN time_entries te ON c.id = te.case_id
      WHERE c.client_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [id]);

    const cases = casesResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      caseNumber: row.case_number,
      practiceArea: row.practice_area,
      status: row.status,
      priority: row.priority,
      openedDate: row.opened_date,
      closedDate: row.closed_date,
      budget: row.budget ? parseFloat(row.budget) : null,
      estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
      actualHours: parseFloat(row.total_hours),
      timeEntryCount: parseInt(row.time_entry_count),
      description: row.description,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    logger.error('Error fetching client cases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client cases',
    });
  }
});

module.exports = router; 