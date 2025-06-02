import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, User, FolderOpen, Clock, Receipt, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: 'client' | 'case' | 'document' | 'invoice' | 'timeEntry' | 'user';
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
  url: string;
}

export function GlobalSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchTerm]);

  // Handle keyboard shortcuts (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // TODO: Make API call to /api/search with debouncedSearchTerm
    console.log('Searching for:', query);
    
    // Mock search results for demonstration
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'client' as const,
        title: 'John Smith',
        subtitle: 'john.smith@example.com',
        metadata: { phone: '+1 555-0123' },
        url: '/clients'
      },
      {
        id: '2',
        type: 'case' as const,
        title: 'Smith vs. ABC Corp',
        subtitle: 'Case #2024-001',
        metadata: { status: 'Active' },
        url: '/cases'
      },
      {
        id: '3',
        type: 'document' as const,
        title: 'Contract Agreement - Smith',
        subtitle: 'Last modified 2 days ago',
        metadata: { size: '2.4 MB' },
        url: '/documents'
      },
      {
        id: '4',
        type: 'invoice' as const,
        title: 'Invoice #INV-2024-001',
        subtitle: 'John Smith - $5,500',
        metadata: { status: 'Paid' },
        url: '/invoices'
      },
      {
        id: '5',
        type: 'timeEntry' as const,
        title: 'Contract Review',
        subtitle: '2.5 hours - John Smith Case',
        metadata: { date: '2024-01-15' },
        url: '/time'
      }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
    setShowResults(true);
    setIsSearching(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          navigate(searchResults[selectedIndex].url);
          setShowResults(false);
          setSearchTerm("");
        }
        break;
      case 'Escape':
        setShowResults(false);
        searchInputRef.current?.blur();
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <User size={16} />;
      case 'case':
        return <FolderOpen size={16} />;
      case 'document':
        return <FileText size={16} />;
      case 'invoice':
        return <Receipt size={16} />;
      case 'timeEntry':
        return <Clock size={16} />;
      case 'user':
        return <User size={16} />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'case':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800';
      case 'timeEntry':
        return 'bg-orange-100 text-orange-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search clients, cases, documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowResults(true)}
          className="w-full pl-10 pr-20 py-2 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSearchResults([]);
              setShowResults(false);
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Search Results Overlay */}
      {showResults && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
        >
          <div className="p-2">
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                onClick={() => {
                  navigate(result.url);
                  setShowResults(false);
                  setSearchTerm("");
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded ${getTypeColor(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {result.title}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {result.subtitle}
                    </p>
                  )}
                  {result.metadata && (
                    <div className="flex gap-2 mt-1">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Searching...</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && searchTerm && searchResults.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 z-50">
          <div className="text-center">
            <p className="text-sm text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        </div>
      )}
    </div>
  );
}