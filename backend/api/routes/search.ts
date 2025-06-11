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
 * Returns search suggestions based on partial query
 * Used for autocomplete functionality
 */
router.get('/search/suggestions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = 5 } = req.query as { q: string; limit?: number };
    const queryText = (q || '').trim();

    if (queryText.length < 2) { // Minimum characters for suggestions
      return res.json({ success: true, data: { suggestions: [] } });
    }

    const suggestBody = {
      suggest: {
        text: queryText,
        simple_phrase: { // Name your suggester
          phrase: {
            field: "suggest_field", // The field configured for suggestions in your ES mapping
            size: Number(limit),
            gram_size: 3, // Max shingle / n-gram size
            direct_generator: [{
              field: "suggest_field",
              suggest_mode: "always" // "popular" or "always"
            }],
            highlight: { // Optional highlighting of suggestions
              pre_tag: "<em>",
              post_tag: "</em>"
            }
          }
        }
      }
    };

    // Assuming 'suggest_field' is available across relevant indices or a dedicated suggestions index
    const elasticResponse = await elasticsearchClient.search({
      index: ['clients', 'cases', 'documents', 'users'], // Or your dedicated suggestions index
      body: suggestBody,
    });

    const suggestions = elasticResponse.body.suggest?.simple_phrase?.[0]?.options.map((option: any) => ({
      text: option.text,
      highlighted: option.highlighted, // If highlighting is used
      score: option.score,
    })) || [];

    res.json({ success: true, data: { suggestions } });

  } catch (error: any) {
    logger.error('Suggestion error', { error, query: req.query.q, errorMessage: error.message });
    if (error.name === 'ElasticsearchClientError' || (error.meta && error.meta.body)) {
      logger.error('Elasticsearch error details for suggestions:', { details: error.meta?.body || error.message });
      return res.status(503).json({
        success: false,
        error: {
          code: 'SEARCH_SERVICE_ERROR',
          message: 'Search suggestions service is currently unavailable. Please try again later.'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch suggestions.'
      },
      data: { suggestions: [] }
    });
  }
});

// TODO: Move to Redis for persistence and scalability
// In-memory cache for recent searches
const recentSearchesCache = new Map<string, Array<{ query: string; timestamp: Date }>>();

// Helper to add a search to the recent list
function addRecentSearch(userId: string, query: string) {
  if (!userId || !query) return;

  const userSearches = recentSearchesCache.get(userId) || [];
  // Remove existing entry if present to avoid duplicates and update timestamp
  const existingIndex = userSearches.findIndex(s => s.query === query);
  if (existingIndex > -1) {
    userSearches.splice(existingIndex, 1);
  }

  userSearches.unshift({ query, timestamp: new Date() }); // Add to the beginning

  // Keep only the last 10 searches
  if (userSearches.length > 10) {
    userSearches.length = 10;
  }

  recentSearchesCache.set(userId, userSearches);
}

/**
 * GET /api/search/recent
 * Returns user's recent searches
 */
router.get('/search/recent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query as { limit?: number };

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID not found.' });
    }

    const userRecentSearches = recentSearchesCache.get(userId) || [];

    res.json({
      success: true,
      data: userRecentSearches.slice(0, Number(limit)) // Apply limit if necessary
    });

  } catch (error) {
    logger.error('Recent searches error', { error, userId: req.user?.id });
    res.status(500).json({ success: false, error: 'Failed to fetch recent searches', data: [] });
  }
});

// Modify the main search endpoint to also record recent searches
router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q, limit = 5, offset = 0 } = req.query as unknown as SearchQuery; // Use unknown for type safety
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

    // Add to recent searches
    if (userId) {
      addRecentSearch(userId, sanitizedQuery);
    }

    const user = req.user as any;
    const userPermissions = user?.permissions || [];
    const userFirmId = user?.firmId;

    const rbacFilters: any[] = [];
    if (userFirmId) {
      rbacFilters.push({ term: { "firmId.keyword": userFirmId } });
    } else {
      logger.warn('User firmId is not available for RBAC filtering. This might restrict search results.', { userId });
      // Depending on policy, you might want to return an error or empty result if firmId is strictly required.
      // For now, the query proceeds, but documents without matching firmId (if field exists) won't match.
    }

    // More granular RBAC (Simplified Example)
    // This part needs significant refinement based on your actual data model and permission system.
    // It should dynamically build filters based on user.permissions.
    const permissionBasedShouldClauses: any[] = [
      { term: { "visibility.keyword": "public" } }, // Data explicitly marked public
      { term: { "ownerId.keyword": userId } },       // User owns the item
      { term: { "assignedUsers.keyword": userId } }  // User is directly assigned
      // Add more specific checks, e.g., based on roles or access control lists:
      // { terms: { "rolesAllowed.keyword": user.roles } },
      // { terms: { "accessList.keyword": userId } }
    ];

    // Only apply granular permission filters if the user is not an admin who can see all data.
    if (!userPermissions.includes('search:all_data')) { // Example admin permission
        // If user has specific 'view' permissions, translate them into query terms.
        // e.g. if userPermissions.includes('cases:view_assigned_only'), add relevant term for cases.
        // This is a placeholder for a more complex permission mapping logic.
        // For now, we use a general set of "should" clauses.
         rbacFilters.push({
            bool: {
                should: permissionBasedShouldClauses,
                minimum_should_match: 1 // Must match at least one of these " উদার" conditions
            }
        });
    }


    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: sanitizedQuery,
                fields: [
                  'title^3', 'name^3', 'email^2', 'subtitle^2',
                  'description', 'content', 'caseNumber^2', 'invoiceNumber^2',
                  'tags^2', 'category' // Added tags and category
                ],
                type: 'best_fields',
                fuzziness: 'AUTO',
                operator: 'and' // More restrictive matching of query terms
              },
            },
          ],
          filter: rbacFilters,
        },
      },
      size: Number(limit) * 6,
      from: Number(offset),
      highlight: {
        fields: {
          "*": {} // Highlight on all fields searched, ES will pick best ones
        },
        pre_tags: ['<strong>'],
        post_tags: ['</strong>'],
        fragment_size: 150,
        number_of_fragments: 1,
      },
    };

    const elasticResponse = await elasticsearchClient.search({
      index: ['clients', 'cases', 'documents', 'invoices', 'time_entries', 'users'],
      body: searchBody,
    });

    const results: CategorizedResults = {
      clients: [], cases: [], documents: [], invoices: [], timeEntries: [], users: [],
      total: elasticResponse.body.hits.total.value,
    };

    elasticResponse.body.hits.hits.forEach((hit: any) => {
      const source = hit._source;
      const highlight = hit.highlight;
      const resultType = hit._index as SearchResult['type'];

      // Helper to get first highlight or fallback to source field
      const getField = (fieldName: string, ...sourceFallbackFields: string[]) => {
        if (highlight && highlight[fieldName]) return highlight[fieldName][0];
        for (const fallback of sourceFallbackFields) {
          if (source[fallback]) return source[fallback];
        }
        return '';
      };

      // Constructing a snippet from highlights or description
      let snippet = '';
      if (highlight) {
        // Concatenate multiple highlight fields if available, preferring 'content'
        if (highlight.content) snippet = highlight.content[0];
        else if (highlight.description) snippet = highlight.description[0];
        else { // Fallback to any other highlight
            for (const key in highlight) {
                snippet = highlight[key][0];
                break;
            }
        }
      } else if (source.description) {
        snippet = source.description.substring(0,150) + (source.description.length > 150 ? '...' : '');
      }


      const searchResult: SearchResult = {
        id: hit._id,
        type: resultType,
        title: getField('title', 'name', 'caseNumber', 'invoiceNumber'),
        subtitle: getField('subtitle', 'email', 'clientName', 'userName'), // Assuming clientName/userName might be in source
        metadata: {
          ...(source.status && { status: source.status }),
          ...(source.caseNumber && { caseNumber: source.caseNumber }),
          ...(source.invoiceNumber && { invoiceNumber: source.invoiceNumber }),
          ...(source.client?.name && { client: source.client.name }),
          ...(source.company && { company: source.company }),
          ...(source.fileSize && { size: source.fileSize.toString() + ' B' }),
          ...(source.mimeType && { mimeType: source.mimeType }),
          ...(source.date && { date: source.date }),
          ...(source.amount && { amount: source.amount?.toString() }),
          ...(snippet && { snippet }),
        },
        url: `/${resultType}/${hit._id}`, // Simpler URL structure
        permissions: source.permissions || [],
      };

      const categoryList = results[resultType as keyof CategorizedResults] as SearchResult[];
      if (categoryList && categoryList.length < Number(limit)) {
        categoryList.push(searchResult);
      }
    });

    res.json({
      success: true,
      data: results,
      query: sanitizedQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Search error', { error, userId: req.user?.id, query: req.query.q });
    
    // Check if the error is from Elasticsearch client
    if (error.name === 'ElasticsearchClientError' || (error.meta && error.meta.body)) {
        logger.error('Elasticsearch error details for search:', { details: error.meta?.body || error.message });
        return res.status(503).json({
            success: false,
            error: {
                code: 'SEARCH_SERVICE_ERROR',
                message: 'Search service is currently unavailable. Please try again later.'
            }
        });
    }

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while performing the search.'
        }
    });
  }
});


export default router;