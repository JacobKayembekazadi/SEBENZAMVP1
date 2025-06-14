import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'assistant' | 'billing';
  hourlyRate?: number;
  isActive: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'prospective';
  createdAt: Date;
  // Enhanced fields
  categories: string[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  relatedClients: string[];
  notes: {
    id: string;
    content: string;
    createdAt: Date;
    createdBy: string;
  }[];
  metrics: {
    totalBilling: number;
    averageCaseValue: number;
    clientSince: Date;
    lastPayment?: Date;
    paymentHistory: {
      date: Date;
      amount: number;
      status: 'paid' | 'pending' | 'overdue';
    }[];
  };
  communicationPreferences: {
    preferredMethod: 'email' | 'phone' | 'mail';
    preferredTime?: string;
    doNotContact: boolean;
    language: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: Date;
    url: string;
  }[];
  activity: {
    id: string;
    type: 'note' | 'call' | 'meeting' | 'email' | 'document' | 'payment';
    description: string;
    date: Date;
    user: string;
  }[];
}

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  clientId: string;
  practiceArea: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  openedDate: Date;
  assignedAttorneys: string[];
  budget?: number;
  estimatedHours?: number;
  actualHours: number;
  description?: string;
}

export interface TimeEntry {
  id: string;
  caseId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  description: string;
  billable: boolean;
  rate: number;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'billed';
}

// Application State
export interface AppState {
  user: User | null;
  clients: Client[];
  cases: Case[];
  timeEntries: TimeEntry[];
  loading: {
    clients: boolean;
    cases: boolean;
    timeEntries: boolean;
    global: boolean;
  };
  errors: {
    clients: string | null;
    cases: string | null;
    timeEntries: string | null;
    global: string | null;
  };
  filters: {
    clients: {
      status?: string;
      search?: string;
    };
    cases: {
      status?: string;
      practiceArea?: string;
      assignedTo?: string;
      search?: string;
    };
  };
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; updates: Partial<Client> } }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'SET_CASES'; payload: Case[] }
  | { type: 'ADD_CASE'; payload: Case }
  | { type: 'UPDATE_CASE'; payload: { id: string; updates: Partial<Case> } }
  | { type: 'DELETE_CASE'; payload: string }
  | { type: 'SET_TIME_ENTRIES'; payload: TimeEntry[] }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { id: string; updates: Partial<TimeEntry> } }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SET_CLIENT_FILTER'; payload: Partial<AppState['filters']['clients']> }
  | { type: 'SET_CASE_FILTER'; payload: Partial<AppState['filters']['cases']> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'UPDATE_CLIENT_CATEGORIES'; payload: { id: string; categories: string[] } }
  | { type: 'UPDATE_CLIENT_TAGS'; payload: { id: string; tags: string[] } }
  | { type: 'UPDATE_CLIENT_RELATIONSHIPS'; payload: { id: string; relatedClients: string[] } }
  | { type: 'ADD_CLIENT_NOTE'; payload: { clientId: string; note: Client['notes'][0] } }
  | { type: 'UPDATE_CLIENT_METRICS'; payload: { id: string; metrics: Client['metrics'] } }
  | { type: 'UPDATE_CLIENT_COMMUNICATION_PREFS'; payload: { id: string; prefs: Client['communicationPreferences'] } }
  | { type: 'ADD_CLIENT_DOCUMENT'; payload: { clientId: string; document: Client['documents'][0] } }
  | { type: 'ADD_CLIENT_ACTIVITY'; payload: { clientId: string; activity: Client['activity'][0] } };

// Initial State
const initialState: AppState = {
  user: null,
  clients: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      company: 'Acme Corporation',
      type: 'business',
      status: 'active',
      createdAt: new Date('2023-01-15'),
      categories: ['Corporate', 'VIP'],
      tags: ['technology', 'high-value', 'long-term'],
      priority: 'high',
      relatedClients: ['2', '3'],
      notes: [],
      metrics: {
        totalBilling: 125000,
        averageCaseValue: 25000,
        clientSince: new Date('2023-01-15'),
        lastPayment: new Date('2024-01-10'),
        paymentHistory: [],
      },
      communicationPreferences: {
        preferredMethod: 'email',
        preferredTime: '9:00 AM - 5:00 PM',
        doNotContact: false,
        language: 'English',
      },
      documents: [],
      activity: [],
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@personal.com',
      phone: '(555) 987-6543',
      type: 'individual',
      status: 'active',
      createdAt: new Date('2023-02-20'),
      categories: ['Individual'],
      tags: ['personal', 'estate-planning'],
      priority: 'medium',
      relatedClients: [],
      notes: [],
      metrics: {
        totalBilling: 45000,
        averageCaseValue: 15000,
        clientSince: new Date('2023-02-20'),
        lastPayment: new Date('2024-01-05'),
        paymentHistory: [],
      },
      communicationPreferences: {
        preferredMethod: 'phone',
        preferredTime: '2:00 PM - 6:00 PM',
        doNotContact: false,
        language: 'English',
      },
      documents: [],
      activity: [],
    },
  ],
  cases: [],
  timeEntries: [],
  loading: {
    clients: false,
    cases: false,
    timeEntries: false,
    global: false,
  },
  errors: {
    clients: null,
    cases: null,
    timeEntries: null,
    global: null,
  },
  filters: {
    clients: {},
    cases: {},
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value },
      };

    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };

    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, ...action.payload.updates }
            : client
        ),
      };

    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
      };

    case 'SET_CASES':
      return { ...state, cases: action.payload };

    case 'ADD_CASE':
      return { ...state, cases: [...state.cases, action.payload] };

    case 'UPDATE_CASE':
      return {
        ...state,
        cases: state.cases.map(caseItem =>
          caseItem.id === action.payload.id
            ? { ...caseItem, ...action.payload.updates }
            : caseItem
        ),
      };

    case 'DELETE_CASE':
      return {
        ...state,
        cases: state.cases.filter(caseItem => caseItem.id !== action.payload),
      };

    case 'SET_TIME_ENTRIES':
      return { ...state, timeEntries: action.payload };

    case 'ADD_TIME_ENTRY':
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };

    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map(entry =>
          entry.id === action.payload.id
            ? { ...entry, ...action.payload.updates }
            : entry
        ),
      };

    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload),
      };

    case 'SET_CLIENT_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          clients: { ...state.filters.clients, ...action.payload },
        },
      };

    case 'SET_CASE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          cases: { ...state.filters.cases, ...action.payload },
        },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          clients: {},
          cases: {},
        },
      };

    case 'UPDATE_CLIENT_CATEGORIES':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, categories: action.payload.categories }
            : client
        ),
      };

    case 'UPDATE_CLIENT_TAGS':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, tags: action.payload.tags }
            : client
        ),
      };

    case 'UPDATE_CLIENT_RELATIONSHIPS':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, relatedClients: action.payload.relatedClients }
            : client
        ),
      };

    case 'ADD_CLIENT_NOTE':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.clientId
            ? { ...client, notes: [...client.notes, action.payload.note] }
            : client
        ),
      };

    case 'UPDATE_CLIENT_METRICS':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, metrics: action.payload.metrics }
            : client
        ),
      };

    case 'UPDATE_CLIENT_COMMUNICATION_PREFS':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, communicationPreferences: action.payload.prefs }
            : client
        ),
      };

    case 'ADD_CLIENT_DOCUMENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.clientId
            ? { ...client, documents: [...client.documents, action.payload.document] }
            : client
        ),
      };

    case 'ADD_CLIENT_ACTIVITY':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.clientId
            ? { ...client, activity: [...client.activity, action.payload.activity] }
            : client
        ),
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return React.createElement(
    AppContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

// Custom Hook
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

// Selector Hooks
export function useUser() {
  const { state } = useAppState();
  return state.user;
}

export function useClients() {
  const { state } = useAppState();
  const { clients } = state;
  const { clients: filters } = state.filters;

  // Apply filters
  let filteredClients = clients;

  if (filters.status) {
    filteredClients = filteredClients.filter(client => client.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredClients = filteredClients.filter(client =>
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower)
    );
  }

  return {
    clients: filteredClients,
    loading: state.loading.clients,
    error: state.errors.clients,
  };
}

export function useCases() {
  const { state } = useAppState();
  const { cases } = state;
  const { cases: filters } = state.filters;

  // Apply filters
  let filteredCases = cases;

  if (filters.status) {
    filteredCases = filteredCases.filter(caseItem => caseItem.status === filters.status);
  }

  if (filters.practiceArea) {
    filteredCases = filteredCases.filter(caseItem => caseItem.practiceArea === filters.practiceArea);
  }

  if (filters.assignedTo) {
    filteredCases = filteredCases.filter(caseItem =>
      caseItem.assignedAttorneys.includes(filters.assignedTo!)
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCases = filteredCases.filter(caseItem =>
      caseItem.title.toLowerCase().includes(searchLower) ||
      caseItem.description?.toLowerCase().includes(searchLower)
    );
  }

  return {
    cases: filteredCases,
    loading: state.loading.cases,
    error: state.errors.cases,
  };
}

export function useTimeEntries() {
  const { state } = useAppState();
  return {
    timeEntries: state.timeEntries,
    loading: state.loading.timeEntries,
    error: state.errors.timeEntries,
  };
} 