import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { elasticsearchClient } from '../config/elasticsearch';
import { logger } from '../utils/logger';

const router = Router();

interface SearchQuery {
  q: string;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  type: 'client' | 'case' | 'document' | 'invoice' | 'timeEntry' | 'user';
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
  url: string;
  permissions: string[];
}

interface CategorizedResults {
  clients: SearchResult[];
  cases: SearchResult[];
  documents: SearchResult[];
  invoices: SearchResult[];
  timeEntries: SearchResult[];
  users: SearchResult[];
  total: number;
}

/**
 * GET /api/search
 * Global search endpoint that queries multiple entity types
 * 
 * Query Parameters:
 * - q: Search query string (required)
 * - limit: Maximum results per category (optional, default: 5)
 * - offset: Pagination offset (optional, default: 0)
 */
router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = 5, offset = 0 } = req.query as SearchQuery;
    const userId = req.user?.id;

    // Validate search query
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Search query parameter "q" is required and must be a non-empty string'
      });
    }

    // Sanitize and limit query length
    const sanitizedQuery = q.trim().substring(0, 200);

    // Log search request for analytics
    logger.info('Search request', {
      userId,
      query: sanitizedQuery,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement Elasticsearch query
    // This would typically involve:
    // 1. Building multi-index search query
    // 2. Applying user permissions filter based on RBAC
    // 3. Executing search across indices: clients, cases, documents, invoices, time_entries, users
    // 4. Aggregating and formatting results

    // Placeholder for Elasticsearch integration
    /*
    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: sanitizedQuery,
                fields: ['title^3', 'subtitle^2', 'content', 'description', 'name', 'email'],
                type: 'best_fields',
                fuzziness: 'AUTO'
              }
            }
          ],
          filter: [
            // TODO: Add RBAC filters based on user permissions
            // This would include filtering by:
            // - User's firm ID
            // - User's role permissions
            // - Document access levels
            // - Client confidentiality settings
          ]
        }
      },
      size: limit,
      from: offset,
      highlight: {
        fields: {
          title: {},
          subtitle: {},
          content: { fragment_size: 150 }
        }
      }
    };

    const elasticResponse = await elasticsearchClient.search({
      index: ['clients', 'cases', 'documents', 'invoices', 'time_entries', 'users'],
      body: searchBody
    });
    */

    // Mock search results for demonstration
    // In production, these would come from Elasticsearch
    const mockResults: CategorizedResults = {
      clients: [
        {
          id: '1',
          type: 'client',
          title: 'John Smith',
          subtitle: 'john.smith@example.com',
          metadata: { phone: '+1 555-0123', status: 'Active' },
          url: '/clients/1',
          permissions: ['client.view', 'client.edit']
        },
        {
          id: '2',
          type: 'client',
          title: 'Jane Smith',
          subtitle: 'jane.smith@company.com',
          metadata: { phone: '+1 555-0124', company: 'Smith Corp' },
          url: '/clients/2',
          permissions: ['client.view']
        }
      ],
      cases: [
        {
          id: '101',
          type: 'case',
          title: 'Smith vs. ABC Corporation',
          subtitle: 'Case #2024-001 - Contract Dispute',
          metadata: { status: 'Active', client: 'John Smith' },
          url: '/cases/101',
          permissions: ['case.view', 'case.edit']
        }
      ],
      documents: [
        {
          id: '201',
          type: 'document',
          title: 'Contract Agreement - Smith',
          subtitle: 'Last modified 2 days ago by Jessica Chen',
          metadata: { size: '2.4 MB', type: 'PDF' },
          url: '/documents/201',
          permissions: ['document.view']
        }
      ],
      invoices: [
        {
          id: '301',
          type: 'invoice',
          title: 'Invoice #INV-2024-001',
          subtitle: 'John Smith - Legal Services',
          metadata: { amount: '$5,500', status: 'Paid', date: '2024-01-15' },
          url: '/invoices/301',
          permissions: ['invoice.view']
        }
      ],
      timeEntries: [
        {
          id: '401',
          type: 'timeEntry',
          title: 'Contract Review - Smith Case',
          subtitle: '2.5 hours recorded by Jessica Chen',
          metadata: { date: '2024-01-15', billable: 'Yes' },
          url: '/time/401',
          permissions: ['time.view']
        }
      ],
      users: [
        {
          id: '501',
          type: 'user',
          title: 'Sarah Smith',
          subtitle: 'Paralegal - Corporate Law',
          metadata: { email: 'sarah.smith@firm.com', extension: '1234' },
          url: '/users/501',
          permissions: ['user.view']
        }
      ],
      total: 6
    };

    // Filter results based on search query (mock implementation)
    const filteredResults: CategorizedResults = {
      clients: mockResults.clients.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      cases: mockResults.cases.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      documents: mockResults.documents.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      invoices: mockResults.invoices.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      timeEntries: mockResults.timeEntries.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      users: mockResults.users.filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(sanitizedQuery.toLowerCase())
      ),
      total: 0
    };

    // Calculate total results
    filteredResults.total = 
      filteredResults.clients.length +
      filteredResults.cases.length +
      filteredResults.documents.length +
      filteredResults.invoices.length +
      filteredResults.timeEntries.length +
      filteredResults.users.length;

    // Apply RBAC filtering
    // TODO: In production, this would be done at the Elasticsearch query level
    // For now, we'll do a simple permission check on the results
    const userPermissions = req.user?.permissions || [];
    
    // Filter out results the user doesn't have permission to view
    Object.keys(filteredResults).forEach(key => {
      if (Array.isArray(filteredResults[key as keyof CategorizedResults])) {
        (filteredResults[key as keyof CategorizedResults] as SearchResult[]) = 
          (filteredResults[key as keyof CategorizedResults] as SearchResult[]).filter(result => {
            // Check if user has at least one of the required permissions
            return result.permissions.some(permission => 
              userPermissions.includes(permission)
            );
          });
      }
    });

    // Return categorized results
    res.json({
      success: true,
      data: filteredResults,
      query: sanitizedQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Search error', { error, userId: req.user?.id });
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while performing the search'
    });
  }
});

/**
 * GET /api/search/suggestions
 * Returns search suggestions based on partial query
 * Used for autocomplete functionality
 */
router.get('/search/suggestions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = 5 } = req.query as { q: string; limit?: number };

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    // TODO: Implement suggestion logic using Elasticsearch completion suggester
    // This would typically use a dedicated suggestion index

    // Mock suggestions
    const suggestions = [
      'John Smith',
      'Smith vs. ABC Corp',
      'Contract Review',
      'Invoice #INV-2024',
      'Legal Research'
    ].filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, limit);

    res.json({ suggestions });

  } catch (error) {
    logger.error('Suggestion error', { error });
    res.json({ suggestions: [] });
  }
});

/**
 * GET /api/search/recent
 * Returns user's recent searches
 */
router.get('/search/recent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query as { limit?: number };

    // TODO: Implement recent searches storage and retrieval
    // This would typically use Redis or a similar cache

    // Mock recent searches
    const recentSearches = [
      { query: 'Smith case', timestamp: '2024-01-15T10:30:00Z' },
      { query: 'Contract template', timestamp: '2024-01-14T15:45:00Z' },
      { query: 'Invoice 2024', timestamp: '2024-01-14T09:20:00Z' }
    ].slice(0, limit);

    res.json({ 
      success: true,
      data: recentSearches 
    });

  } catch (error) {
    logger.error('Recent searches error', { error });
    res.json({ success: true, data: [] });
  }
});

export default router; 