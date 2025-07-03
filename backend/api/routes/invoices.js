const express = require('express');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, transaction, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Invoice statuses
const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

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

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const result = await query(
    'SELECT COUNT(*) as count FROM invoices WHERE EXTRACT(year FROM created_at) = $1',
    [year]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `INV-${year}-${count.toString().padStart(4, '0')}`;
};

// GET /api/invoices - Get all invoices
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('search').optional().trim(),
  expressQuery('status').optional().isIn(invoiceStatuses),
  expressQuery('clientId').optional().isUUID(),
  expressQuery('caseId').optional().isUUID(),
  expressQuery('sortBy').optional().isIn(['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      clientId,
      caseId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Base query with joins
    let baseQuery = `
      SELECT 
        i.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company
      FROM invoices i
      JOIN clients cl ON i.client_id = cl.id
      LEFT JOIN cases c ON i.case_id = c.id
    `;

    // Build filters
    const filters = {};
    if (status) filters['i.status'] = status;
    if (clientId) filters['i.client_id'] = clientId;
    if (caseId) filters['i.case_id'] = caseId;

    // Build search conditions
    let searchConditions = '';
    let searchValues = [];
    if (search) {
      const searchIndex = Object.keys(filters).length + 1;
      searchConditions = `AND (
        i.invoice_number ILIKE $${searchIndex} OR
        cl.first_name ILIKE $${searchIndex} OR
        cl.last_name ILIKE $${searchIndex} OR
        cl.company ILIKE $${searchIndex} OR
        c.title ILIKE $${searchIndex}
      )`;
      searchValues = [`%${search}%`];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const orderClause = `ORDER BY i.${sortBy === 'createdAt' ? 'created_at' : sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      JOIN clients cl ON i.client_id = cl.id
      LEFT JOIN cases c ON i.case_id = c.id
      ${whereClause}
      ${searchConditions}
    `;
    const countResult = await query(countQuery, [...values, ...searchValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get invoices
    const invoicesQuery = `
      ${baseQuery}
      ${whereClause}
      ${searchConditions}
      ${orderClause}
      ${paginationClause}
    `;
    const invoicesResult = await query(invoicesQuery, [...values, ...searchValues]);

    // Transform results
    const invoices = invoicesResult.rows.map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
      },
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      paidAmount: parseFloat(row.paid_amount),
      paymentTerms: row.payment_terms,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
    });
  }
});

// GET /api/invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        i.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company as client_company,
        cl.email as client_email,
        cl.address as client_address
      FROM invoices i
      JOIN clients cl ON i.client_id = cl.id
      LEFT JOIN cases c ON i.case_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const row = result.rows[0];
    const invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        company: row.client_company,
        email: row.client_email,
        address: row.client_address,
      },
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      paidAmount: parseFloat(row.paid_amount),
      paymentTerms: row.payment_terms,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
    });
  }
});

// POST /api/invoices - Create new invoice
router.post('/', [
  body('clientId').isUUID().withMessage('Valid client ID is required'),
  body('caseId').optional().isUUID().withMessage('Valid case ID required'),
  body('issueDate').isISO8601().withMessage('Valid issue date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
  body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be positive'),
  body('paymentTerms').optional().trim(),
  body('notes').optional().trim(),
], handleValidationErrors, authorize('admin', 'attorney', 'billing'), async (req, res) => {
  try {
    const {
      clientId,
      caseId,
      issueDate,
      dueDate,
      subtotal,
      taxAmount = 0,
      paymentTerms = 'Net 30',
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

    // Verify case exists if provided
    if (caseId) {
      const caseResult = await query('SELECT id FROM cases WHERE id = $1 AND client_id = $2', [caseId, clientId]);
      if (caseResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Case not found or does not belong to this client',
        });
      }
    }

    const invoiceId = uuidv4();
    const invoiceNumber = await generateInvoiceNumber();
    const totalAmount = parseFloat(subtotal) + parseFloat(taxAmount);
    
    const result = await query(`
      INSERT INTO invoices (
        id, invoice_number, client_id, case_id, issue_date, due_date, status,
        subtotal, tax_amount, total_amount, payment_terms, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `, [
      invoiceId,
      invoiceNumber,
      clientId,
      caseId || null,
      issueDate,
      dueDate,
      'draft',
      subtotal,
      taxAmount,
      totalAmount,
      paymentTerms,
      notes || null,
    ]);

    const row = result.rows[0];
    const invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      caseId: row.case_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      paidAmount: parseFloat(row.paid_amount),
      paymentTerms: row.payment_terms,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Invoice created: ${invoice.invoiceNumber} (${invoice.id})`);

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
    });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', [
  body('issueDate').optional().isISO8601().withMessage('Valid issue date is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('status').optional().isIn(invoiceStatuses).withMessage('Invalid status'),
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
  body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be positive'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
  body('paymentTerms').optional().trim(),
  body('notes').optional().trim(),
], handleValidationErrors, authorize('admin', 'attorney', 'billing'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if invoice exists
    const existingInvoice = await query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (existingInvoice.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const existing = existingInvoice.rows[0];

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const fieldMappings = {
      issueDate: 'issue_date',
      dueDate: 'due_date',
      status: 'status',
      subtotal: 'subtotal',
      taxAmount: 'tax_amount',
      paidAmount: 'paid_amount',
      paymentTerms: 'payment_terms',
      notes: 'notes',
    };

    Object.entries(fieldMappings).forEach(([key, dbField]) => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${dbField} = $${paramIndex++}`);
        updateValues.push(updateData[key]);
      }
    });

    // Recalculate total amount if subtotal or tax changed
    if (updateData.subtotal !== undefined || updateData.taxAmount !== undefined) {
      const newSubtotal = updateData.subtotal !== undefined ? updateData.subtotal : existing.subtotal;
      const newTaxAmount = updateData.taxAmount !== undefined ? updateData.taxAmount : existing.tax_amount;
      const newTotalAmount = parseFloat(newSubtotal) + parseFloat(newTaxAmount);
      
      updateFields.push(`total_amount = $${paramIndex++}`);
      updateValues.push(newTotalAmount);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE invoices 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const row = result.rows[0];
    
    const invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      caseId: row.case_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      paidAmount: parseFloat(row.paid_amount),
      paymentTerms: row.payment_terms,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Invoice updated: ${invoice.invoiceNumber} (${invoice.id})`);

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
    });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if invoice is paid
    const invoiceResult = await query('SELECT status, invoice_number FROM invoices WHERE id = $1', [id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const invoice = invoiceResult.rows[0];
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoices',
      });
    }

    await query('DELETE FROM invoices WHERE id = $1', [id]);

    logger.info(`Invoice deleted: ${invoice.invoice_number} (${id})`);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
    });
  }
});

// POST /api/invoices/:id/send - Send invoice to client
router.post('/:id/send', authorize('admin', 'attorney', 'billing'), async (req, res) => {
  try {
    const { id } = req.params;

    // Update invoice status to sent
    const result = await query(`
      UPDATE invoices 
      SET status = 'sent', updated_at = NOW()
      WHERE id = $1 AND status = 'draft'
      RETURNING invoice_number
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice not found or cannot be sent (already sent or not in draft status)',
      });
    }

    const invoiceNumber = result.rows[0].invoice_number;

    // TODO: Send email to client with invoice
    
    logger.info(`Invoice sent: ${invoiceNumber} (${id})`);

    res.json({
      success: true,
      message: 'Invoice sent successfully',
    });
  } catch (error) {
    logger.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice',
    });
  }
});

// POST /api/invoices/:id/mark-paid - Mark invoice as paid
router.post('/:id/mark-paid', [
  body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
], handleValidationErrors, authorize('admin', 'attorney', 'billing'), async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount } = req.body;

    const result = await query(`
      UPDATE invoices 
      SET status = 'paid', paid_amount = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING invoice_number, total_amount
    `, [paidAmount, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const invoice = result.rows[0];
    logger.info(`Invoice marked as paid: ${invoice.invoice_number} (${id})`);

    res.json({
      success: true,
      message: 'Invoice marked as paid',
    });
  } catch (error) {
    logger.error('Error marking invoice as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark invoice as paid',
    });
  }
});

module.exports = router; 