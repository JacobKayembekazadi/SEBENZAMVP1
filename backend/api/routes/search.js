const express = require('express');
const { query, validationResult } = require('express-validator');
const { db } = require('../../lib/database');
const { logger } = require('../../lib/logger');

const router = express.Router();

// Global search endpoint
router.get('/', [
  query('q').trim().isLength({ min: 1, max: 200 }),
  query('type').optional().isIn(['all', 'clients', 'cases', 'documents', 'invoices', 'timeEntries', 'users']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
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

    const { q, type = 'all', limit = 20, offset = 0 } = req.query;
    const searchTerm = `%${q.toLowerCase()}%`;

    // Log search request
    logger.info(`Search request: "${q}" by user ${req.user?.id}`);

    const results = {
      clients: [],
      cases: [],
      documents: [],
      invoices: [],
      timeEntries: [],
      users: [],
      total: 0
    };

    // Search clients
    if (type === 'all' || type === 'clients') {
      const clientsQuery = `
        SELECT 
          id, first_name, last_name, email, company, phone, status, created_at,
          'client' as type
        FROM clients 
        WHERE 
          LOWER(first_name) LIKE $1 OR 
          LOWER(last_name) LIKE $1 OR 
          LOWER(email) LIKE $1 OR 
          LOWER(company) LIKE $1 OR
          LOWER(phone) LIKE $1
        ORDER BY 
          CASE 
            WHEN LOWER(first_name || ' ' || last_name) LIKE $1 THEN 1
            WHEN LOWER(email) LIKE $1 THEN 2
            WHEN LOWER(company) LIKE $1 THEN 3
            ELSE 4
          END
        LIMIT $2 OFFSET $3
      `;

      const clientsResult = await db.query(clientsQuery, [searchTerm, limit, offset]);
      
      results.clients = clientsResult.rows.map(row => ({
        id: row.id,
        type: 'client',
        title: `${row.first_name} ${row.last_name}`,
        subtitle: row.email || row.company,
        metadata: {
          company: row.company,
          phone: row.phone,
          status: row.status
        },
        url: `/clients/${row.id}`,
        createdAt: row.created_at
      }));
    }

    // Search cases
    if (type === 'all' || type === 'cases') {
      const casesQuery = `
        SELECT 
          c.id, c.title, c.case_number, c.practice_area, c.status, c.priority,
          c.description, c.opened_date,
          cl.first_name || ' ' || cl.last_name as client_name,
          'case' as type
        FROM cases c
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE 
          LOWER(c.title) LIKE $1 OR 
          LOWER(c.case_number) LIKE $1 OR 
          LOWER(c.description) LIKE $1 OR
          LOWER(c.practice_area) LIKE $1
        ORDER BY 
          CASE 
            WHEN LOWER(c.title) LIKE $1 THEN 1
            WHEN LOWER(c.case_number) LIKE $1 THEN 2
            ELSE 3
          END
        LIMIT $2 OFFSET $3
      `;

      const casesResult = await db.query(casesQuery, [searchTerm, limit, offset]);
      
      results.cases = casesResult.rows.map(row => ({
        id: row.id,
        type: 'case',
        title: row.title,
        subtitle: `${row.case_number} - ${row.client_name}`,
        metadata: {
          practiceArea: row.practice_area,
          status: row.status,
          priority: row.priority,
          clientName: row.client_name
        },
        url: `/cases/${row.id}`,
        createdAt: row.opened_date
      }));
    }

    // Search documents
    if (type === 'all' || type === 'documents') {
      const documentsQuery = `
        SELECT 
          d.id, d.name, d.type, d.file_size, d.mime_type, d.created_at,
          d.is_confidential, d.tags,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name,
          u.first_name || ' ' || u.last_name as uploaded_by_name,
          'document' as type
        FROM documents d
        LEFT JOIN cases c ON d.case_id = c.id
        LEFT JOIN clients cl ON d.client_id = cl.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 
          LOWER(d.name) LIKE $1 OR 
          LOWER(d.type) LIKE $1 OR
          EXISTS (SELECT 1 FROM unnest(d.tags) tag WHERE LOWER(tag) LIKE $1)
        ORDER BY d.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const documentsResult = await db.query(documentsQuery, [searchTerm, limit, offset]);
      
      results.documents = documentsResult.rows.map(row => ({
        id: row.id,
        type: 'document',
        title: row.name,
        subtitle: `${row.type} - ${row.uploaded_by_name}`,
        metadata: {
          fileSize: row.file_size,
          mimeType: row.mime_type,
          isConfidential: row.is_confidential,
          caseName: row.case_title,
          clientName: row.client_name,
          tags: row.tags
        },
        url: `/documents/${row.id}`,
        createdAt: row.created_at
      }));
    }

    // Search invoices
    if (type === 'all' || type === 'invoices') {
      const invoicesQuery = `
        SELECT 
          i.id, i.invoice_number, i.total_amount, i.paid_amount, i.status,
          i.issue_date, i.due_date,
          cl.first_name || ' ' || cl.last_name as client_name,
          c.title as case_title,
          'invoice' as type
        FROM invoices i
        LEFT JOIN clients cl ON i.client_id = cl.id
        LEFT JOIN cases c ON i.case_id = c.id
        WHERE 
          LOWER(i.invoice_number) LIKE $1 OR
          LOWER(cl.first_name || ' ' || cl.last_name) LIKE $1
        ORDER BY i.issue_date DESC
        LIMIT $2 OFFSET $3
      `;

      const invoicesResult = await db.query(invoicesQuery, [searchTerm, limit, offset]);
      
      results.invoices = invoicesResult.rows.map(row => ({
        id: row.id,
        type: 'invoice',
        title: `Invoice ${row.invoice_number}`,
        subtitle: `${row.client_name} - $${row.total_amount}`,
        metadata: {
          amount: row.total_amount,
          paidAmount: row.paid_amount,
          status: row.status,
          issueDate: row.issue_date,
          dueDate: row.due_date,
          clientName: row.client_name,
          caseName: row.case_title
        },
        url: `/invoices/${row.id}`,
        createdAt: row.issue_date
      }));
    }

    // Search time entries
    if (type === 'all' || type === 'timeEntries') {
      const timeEntriesQuery = `
        SELECT 
          te.id, te.description, te.duration, te.rate, te.amount, te.date,
          te.billable, te.status,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name,
          u.first_name || ' ' || u.last_name as user_name,
          'timeEntry' as type
        FROM time_entries te
        LEFT JOIN cases c ON te.case_id = c.id
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN users u ON te.user_id = u.id
        WHERE 
          LOWER(te.description) LIKE $1 OR
          LOWER(c.title) LIKE $1 OR
          LOWER(cl.first_name || ' ' || cl.last_name) LIKE $1
        ORDER BY te.date DESC
        LIMIT $2 OFFSET $3
      `;

      const timeEntriesResult = await db.query(timeEntriesQuery, [searchTerm, limit, offset]);
      
      results.timeEntries = timeEntriesResult.rows.map(row => ({
        id: row.id,
        type: 'timeEntry',
        title: row.description,
        subtitle: `${row.duration} hours - ${row.user_name}`,
        metadata: {
          duration: row.duration,
          rate: row.rate,
          amount: row.amount,
          billable: row.billable,
          status: row.status,
          date: row.date,
          caseName: row.case_title,
          clientName: row.client_name,
          userName: row.user_name
        },
        url: `/time-entries/${row.id}`,
        createdAt: row.date
      }));
    }

    // Search users (admin only)
    if ((type === 'all' || type === 'users') && req.user?.role === 'admin') {
      const usersQuery = `
        SELECT 
          id, first_name, last_name, email, role, hourly_rate, is_active, created_at,
          'user' as type
        FROM users 
        WHERE 
          LOWER(first_name) LIKE $1 OR 
          LOWER(last_name) LIKE $1 OR 
          LOWER(email) LIKE $1 OR
          LOWER(role) LIKE $1
        ORDER BY 
          CASE 
            WHEN LOWER(first_name || ' ' || last_name) LIKE $1 THEN 1
            WHEN LOWER(email) LIKE $1 THEN 2
            ELSE 3
          END
        LIMIT $2 OFFSET $3
      `;

      const usersResult = await db.query(usersQuery, [searchTerm, limit, offset]);
      
      results.users = usersResult.rows.map(row => ({
        id: row.id,
        type: 'user',
        title: `${row.first_name} ${row.last_name}`,
        subtitle: `${row.role} - ${row.email}`,
        metadata: {
          email: row.email,
          role: row.role,
          hourlyRate: row.hourly_rate,
          isActive: row.is_active
        },
        url: `/users/${row.id}`,
        createdAt: row.created_at
      }));
    }

    // Calculate total results
    results.total = results.clients.length + 
                   results.cases.length + 
                   results.documents.length + 
                   results.invoices.length + 
                   results.timeEntries.length + 
                   results.users.length;

    res.json({
      success: true,
      data: results,
      query: q,
      type,
      pagination: {
        limit,
        offset,
        total: results.total
      }
    });

  } catch (error) {
    logger.error('Error performing search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform search'
    });
  }
});

// Quick search endpoint (for autocomplete/suggestions)
router.get('/quick', [
  query('q').trim().isLength({ min: 1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
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

    const { q, limit = 10 } = req.query;
    const searchTerm = `%${q.toLowerCase()}%`;

    // Quick search across primary entities
    const quickSearchQuery = `
      (
        SELECT 
          id, first_name || ' ' || last_name as title, 'client' as type, 
          '/clients/' || id as url
        FROM clients 
        WHERE LOWER(first_name || ' ' || last_name) LIKE $1
        LIMIT $2
      )
      UNION ALL
      (
        SELECT 
          id, title, 'case' as type, 
          '/cases/' || id as url
        FROM cases 
        WHERE LOWER(title) LIKE $1
        LIMIT $2
      )
      UNION ALL
      (
        SELECT 
          id, 'Invoice ' || invoice_number as title, 'invoice' as type,
          '/invoices/' || id as url
        FROM invoices 
        WHERE LOWER(invoice_number) LIKE $1
        LIMIT $2
      )
      ORDER BY title
      LIMIT $2
    `;

    const result = await db.query(quickSearchQuery, [searchTerm, limit]);

    const suggestions = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type,
      url: row.url
    }));

    res.json({
      success: true,
      data: suggestions,
      query: q
    });

  } catch (error) {
    logger.error('Error performing quick search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform quick search'
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', [
  query('q').trim().isLength({ min: 1, max: 100 }),
  query('type').optional().isIn(['clients', 'cases', 'documents', 'invoices']),
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

    const { q, type } = req.query;

    // Get search suggestions based on query and type
    let suggestions = [];

    if (!type || type === 'clients') {
      const clientSuggestions = await db.query(`
        SELECT DISTINCT first_name || ' ' || last_name as suggestion
        FROM clients 
        WHERE LOWER(first_name || ' ' || last_name) LIKE $1
        LIMIT 5
      `, [`%${q.toLowerCase()}%`]);
      
      suggestions.push(...clientSuggestions.rows.map(r => r.suggestion));
    }

    if (!type || type === 'cases') {
      const caseSuggestions = await db.query(`
        SELECT DISTINCT title as suggestion
        FROM cases 
        WHERE LOWER(title) LIKE $1
        LIMIT 5
      `, [`%${q.toLowerCase()}%`]);
      
      suggestions.push(...caseSuggestions.rows.map(r => r.suggestion));
    }

    // Remove duplicates and limit results
    suggestions = [...new Set(suggestions)].slice(0, 10);

    res.json({
      success: true,
      data: suggestions,
      query: q
    });

  } catch (error) {
    logger.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
});

module.exports = router; 