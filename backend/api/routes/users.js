const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { db } = require('../../lib/database');
const { logger } = require('../../lib/logger');

const router = express.Router();

// Validation middleware
const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['admin', 'attorney', 'paralegal', 'assistant', 'billing']),
  body('hourlyRate').optional().isNumeric().toFloat(),
];

const validateUserUpdate = [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('role').optional().isIn(['admin', 'attorney', 'paralegal', 'assistant', 'billing']),
  body('hourlyRate').optional().isNumeric().toFloat(),
  body('isActive').optional().isBoolean(),
];

// Get all users with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['admin', 'attorney', 'paralegal', 'assistant', 'billing']),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['firstName', 'lastName', 'email', 'role', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
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

    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Build where conditions
    if (role) {
      whereConditions.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      params.push(isActive);
    }

    if (search) {
      whereConditions.push(`(
        LOWER(first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get users
    const usersQuery = `
      SELECT 
        id, email, first_name, last_name, role, hourly_rate, 
        is_active, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    params.push(limit, offset);

    const result = await db.query(usersQuery, params);

    // Transform to camelCase
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      hourlyRate: row.hourly_rate,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.json({
      success: true,
      data: { users, pagination }
    });

  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/:id', [
  param('id').isUUID()
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

    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        id, email, first_name, last_name, role, hourly_rate, 
        is_active, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      role: result.rows[0].role,
      hourlyRate: result.rows[0].hourly_rate,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user
router.post('/', validateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, hourlyRate } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, hourly_rate)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, hourly_rate, is_active, created_at, updated_at
    `, [email, hashedPassword, firstName, lastName, role, hourlyRate]);

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      role: result.rows[0].role,
      hourlyRate: result.rows[0].hourly_rate,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    logger.info(`User created: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });

  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user
router.put('/:id', [
  param('id').isUUID(),
  ...validateUserUpdate
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

    const { id } = req.params;
    const updates = req.body;

    // Remove undefined and empty fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === '') {
        delete updates[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const dbField = key === 'firstName' ? 'first_name' :
                     key === 'lastName' ? 'last_name' :
                     key === 'hourlyRate' ? 'hourly_rate' :
                     key === 'isActive' ? 'is_active' : key;
      
      fields.push(`${dbField} = $${paramIndex++}`);
      values.push(value);
    });

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, role, hourly_rate, is_active, created_at, updated_at
    `;

    const result = await db.query(updateQuery, values);

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      role: result.rows[0].role,
      hourlyRate: result.rows[0].hourly_rate,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    logger.info(`User updated: ${user.email}`);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (soft delete)
router.delete('/:id', [
  param('id').isUUID()
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

    const { id } = req.params;

    // Check if user exists
    const existingUser = await db.query('SELECT id, email FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by setting is_active to false
    await db.query(`
      UPDATE users 
      SET is_active = false, updated_at = $1
      WHERE id = $2
    `, [new Date(), id]);

    logger.info(`User deactivated: ${existingUser.rows[0].email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get user roles
router.get('/meta/roles', async (req, res) => {
  try {
    const roles = ['admin', 'attorney', 'paralegal', 'assistant', 'billing'];
    
    res.json({
      success: true,
      data: roles
    });

  } catch (error) {
    logger.error('Error fetching user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user roles'
    });
  }
});

module.exports = router; 