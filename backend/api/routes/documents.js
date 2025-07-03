const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult, query: expressQuery } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, buildWhereClause, buildPaginationClause } = require('../../lib/database');
const { logger } = require('../../lib/logger');
const { authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Document types
const documentTypes = [
  'contract', 'pleading', 'correspondence', 'evidence', 
  'invoice', 'receipt', 'memo', 'report', 'other'
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

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

// GET /api/documents - Get all documents
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).toInt(),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  expressQuery('search').optional().trim(),
  expressQuery('type').optional().isIn(documentTypes),
  expressQuery('caseId').optional().isUUID(),
  expressQuery('clientId').optional().isUUID(),
  expressQuery('isConfidential').optional().isBoolean(),
  expressQuery('sortBy').optional().isIn(['name', 'type', 'fileSize', 'createdAt']),
  expressQuery('sortOrder').optional().isIn(['asc', 'desc']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      caseId,
      clientId,
      isConfidential,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Base query with joins
    let baseQuery = `
      SELECT 
        d.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        u.first_name as uploader_first_name,
        u.last_name as uploader_last_name
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN users u ON d.uploaded_by = u.id
    `;

    // Build filters
    const filters = {};
    if (type) filters['d.type'] = type;
    if (caseId) filters['d.case_id'] = caseId;
    if (clientId) filters['d.client_id'] = clientId;
    if (isConfidential !== undefined) filters['d.is_confidential'] = isConfidential;

    // Build search conditions
    let searchConditions = '';
    let searchValues = [];
    if (search) {
      const searchIndex = Object.keys(filters).length + 1;
      searchConditions = `AND (
        d.name ILIKE $${searchIndex} OR
        c.title ILIKE $${searchIndex} OR
        cl.first_name ILIKE $${searchIndex} OR
        cl.last_name ILIKE $${searchIndex}
      )`;
      searchValues = [`%${search}%`];
    }

    const { whereClause, values } = buildWhereClause(filters);
    const orderClause = `ORDER BY d.${sortBy} ${sortOrder.toUpperCase()}`;
    const paginationClause = buildPaginationClause(page, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      ${whereClause}
      ${searchConditions}
    `;
    const countResult = await query(countQuery, [...values, ...searchValues]);
    const total = parseInt(countResult.rows[0].total);

    // Get documents
    const documentsQuery = `
      ${baseQuery}
      ${whereClause}
      ${searchConditions}
      ${orderClause}
      ${paginationClause}
    `;
    const documentsResult = await query(documentsQuery, [...values, ...searchValues]);

    // Transform results
    const documents = documentsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      clientId: row.client_id,
      client: row.client_first_name ? {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
      } : null,
      fileUrl: row.file_url,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      uploader: row.uploader_first_name ? {
        firstName: row.uploader_first_name,
        lastName: row.uploader_last_name,
      } : null,
      tags: row.tags || [],
      isConfidential: row.is_confidential,
      version: row.version,
      parentDocumentId: row.parent_document_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        d.*,
        c.title as case_title,
        c.case_number,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        u.first_name as uploader_first_name,
        u.last_name as uploader_last_name,
        u.email as uploader_email
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const row = result.rows[0];
    const document = {
      id: row.id,
      name: row.name,
      type: row.type,
      caseId: row.case_id,
      case: row.case_title ? {
        title: row.case_title,
        caseNumber: row.case_number,
      } : null,
      clientId: row.client_id,
      client: row.client_first_name ? {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
      } : null,
      fileUrl: row.file_url,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      uploader: row.uploader_first_name ? {
        firstName: row.uploader_first_name,
        lastName: row.uploader_last_name,
        email: row.uploader_email,
      } : null,
      tags: row.tags || [],
      isConfidential: row.is_confidential,
      version: row.version,
      parentDocumentId: row.parent_document_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
});

// POST /api/documents - Upload new document
router.post('/', upload.single('file'), [
  body('name').optional().trim(),
  body('type').isIn(documentTypes).withMessage('Invalid document type'),
  body('caseId').optional().isUUID().withMessage('Invalid case ID'),
  body('clientId').optional().isUUID().withMessage('Invalid client ID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isConfidential').optional().isBoolean().withMessage('isConfidential must be boolean'),
], handleValidationErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const {
      name,
      type,
      caseId,
      clientId,
      tags = [],
      isConfidential = false,
    } = req.body;

    const userId = req.user.id;

    // Verify case or client exists if provided
    if (caseId) {
      const caseResult = await query('SELECT id FROM cases WHERE id = $1', [caseId]);
      if (caseResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Case not found',
        });
      }
    }

    if (clientId) {
      const clientResult = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (clientResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Client not found',
        });
      }
    }

    const documentId = uuidv4();
    const fileName = name || req.file.originalname;
    
    const result = await query(`
      INSERT INTO documents (
        id, name, type, case_id, client_id, file_url, file_size, mime_type,
        uploaded_by, tags, is_confidential, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [
      documentId,
      fileName,
      type,
      caseId || null,
      clientId || null,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      userId,
      tags,
      isConfidential,
    ]);

    const row = result.rows[0];
    const document = {
      id: row.id,
      name: row.name,
      type: row.type,
      caseId: row.case_id,
      clientId: row.client_id,
      fileUrl: row.file_url,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      tags: row.tags || [],
      isConfidential: row.is_confidential,
      version: row.version,
      parentDocumentId: row.parent_document_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Document uploaded: ${document.name} (${document.id})`);

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
    });
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', [
  body('name').optional().trim(),
  body('type').optional().isIn(documentTypes).withMessage('Invalid document type'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isConfidential').optional().isBoolean().withMessage('isConfidential must be boolean'),
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if document exists
    const existingDocument = await query('SELECT id FROM documents WHERE id = $1', [id]);
    if (existingDocument.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const fieldMappings = {
      name: 'name',
      type: 'type',
      tags: 'tags',
      isConfidential: 'is_confidential',
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
      UPDATE documents 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const row = result.rows[0];
    
    const document = {
      id: row.id,
      name: row.name,
      type: row.type,
      caseId: row.case_id,
      clientId: row.client_id,
      fileUrl: row.file_url,
      fileSize: parseInt(row.file_size),
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      tags: row.tags || [],
      isConfidential: row.is_confidential,
      version: row.version,
      parentDocumentId: row.parent_document_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    logger.info(`Document updated: ${document.name} (${document.id})`);

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully',
    });
  } catch (error) {
    logger.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
    });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', authorize('admin', 'attorney'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING name, file_url', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const deletedDocument = result.rows[0];
    
    // TODO: Delete the actual file from disk
    // fs.unlinkSync(deletedDocument.file_url);

    logger.info(`Document deleted: ${deletedDocument.name} (${id})`);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
});

// GET /api/documents/:id/download - Download document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = result.rows[0];
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(document.file_url)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.setHeader('Content-Type', document.mime_type);

    // Stream the file
    const fileStream = fs.createReadStream(document.file_url);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
    });
  }
});

module.exports = router; 