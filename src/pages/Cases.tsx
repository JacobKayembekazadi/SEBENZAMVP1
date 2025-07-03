import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CaseForm } from "@/components/forms/CaseForm";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Calendar,
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  MessageSquare,
  FileText,
  Upload,
  StickyNote,
  Receipt,
  Play,
  Pause,
  Timer
} from "lucide-react";
import { CaseDetailView } from "@/components/cases/CaseDetailView";

interface Case {
  id: string;
  title: string;
  clientId: string;
  practiceArea: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  description?: string;
  assignedTo?: string | string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  budget?: number;
  hourlyRate?: number;
  billingMethod?: 'hourly' | 'fixed' | 'contingency';
  documents?: any[];
  notes?: any[];
  tasks?: any[];
  milestones?: any[];
  expenses?: any[];
  timeEntries?: any[];
  invoices?: any[];
  payments?: any[];
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  createdDate: string;
  estimatedHours: number;
  actualHours: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  tasks: string[];
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  url: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'meeting' | 'research' | 'strategy';
  createdBy: string;
  createdDate: string;
  isPrivate: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdDate: string;
  isClient: boolean;
}

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  date: string;
  rate: number;
  billable: boolean;
  employee: string;
  task?: string;
}

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'task_created' | 'task_completed' | 'file_uploaded' | 'note_added' | 'milestone_reached';
  description: string;
  user: string;
  date: string;
  details?: any;
}

interface CaseFormData {
  title: string;
  caseNumber?: string;
  clientId: string;
  practiceArea: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAttorneys: string[];
  opposingCounsel?: string;
  courtInfo?: {
    courtName: string;
    judgeAssigned?: string;
    caseNumber?: string;
  };
  budget?: number;
  estimatedHours?: number;
  description?: string;
  notes?: string;
}

// Mock data
const mockClients = [
  { id: '1', firstName: 'John', lastName: 'Doe', company: 'Acme Corp' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', company: 'XYZ Inc' },
  { id: '3', firstName: 'Bob', lastName: 'Johnson', company: 'ABC Ltd' },
];

const mockAttorneys = [
  { id: '1', firstName: 'Sarah', lastName: 'Wilson' },
  { id: '2', firstName: 'Michael', lastName: 'Brown' },
  { id: '3', firstName: 'Emily', lastName: 'Davis' },
];

const mockCases: Case[] = [
  {
    id: '1',
    title: 'Smith vs. Johnson',
    clientId: '1',
    practiceArea: 'Corporate Law',
    status: 'active',
    description: 'Contract dispute between two companies',
    assignedTo: ['1'],
    priority: 'high',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 50000,
    hourlyRate: 250,
    billingMethod: 'hourly',
    documents: [],
    notes: [],
    tasks: [],
    milestones: [],
    expenses: [],
    timeEntries: [],
    invoices: [],
    payments: [],
    customFields: {},
    tags: ['corporate', 'contract'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    activities: []
  },
  {
    id: '2',
    title: 'Davidson Estate Planning',
    clientId: '2',
    practiceArea: 'Estate Planning',
    status: 'pending',
    description: 'Comprehensive estate planning including will preparation, trust establishment, and tax optimization strategies.',
    assignedTo: ['2'],
    priority: 'medium',
    startDate: '2024-01-15',
    endDate: '2024-08-15',
    budget: 25000,
    hourlyRate: 200,
    billingMethod: 'fixed',
    documents: [],
    notes: [],
    tasks: [],
    milestones: [],
    expenses: [],
    timeEntries: [],
    invoices: [],
    payments: [],
    customFields: {},
    tags: ['estate', 'planning'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    activities: []
  },
  {
    id: '3',
    title: 'Westlake Merger',
    clientId: '3',
    practiceArea: 'Corporate Law',
    status: 'active',
    description: 'M&A transaction involving due diligence, regulatory approval, and contract negotiation for Westlake Corp acquisition.',
    assignedTo: ['1', '2', '3'],
    priority: 'high',
    startDate: '2024-01-18',
    endDate: '2024-12-31',
    budget: 500000,
    hourlyRate: 300,
    billingMethod: 'hourly',
    documents: [],
    notes: [],
    tasks: [],
    milestones: [],
    expenses: [],
    timeEntries: [],
    invoices: [],
    payments: [],
    customFields: {},
    tags: ['merger', 'acquisition'],
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    activities: []
  }
];

const Cases = () => {
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [showEditCaseDialog, setShowEditCaseDialog] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>(mockCases);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(caseItem.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.practiceArea.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCreateCase = async (data: CaseFormData) => {
    const newCase: Case = {
      id: String(cases.length + 1),
      title: data.title,
      clientId: data.clientId,
      practiceArea: data.practiceArea,
      status: data.status,
      description: data.description,
      assignedTo: data.assignedAttorneys,
      priority: data.priority,
      startDate: new Date().toISOString(),
      endDate: undefined,
      budget: data.budget,
      hourlyRate: undefined,
      billingMethod: undefined,
      documents: [],
      notes: [],
      tasks: [],
      milestones: [],
      expenses: [],
      timeEntries: [],
      invoices: [],
      payments: [],
      customFields: {},
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: []
    };

    setCases(prev => [...prev, newCase]);
    setShowNewCaseDialog(false);
    
    toast({
      title: "Case Created",
      description: `Case "${data.title}" has been created successfully.`,
    });
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setShowEditCaseDialog(true);
  };

  const handleUpdateCase = async (data: CaseFormData) => {
    if (!editingCase) return;

    const updatedCase: Case = {
      ...editingCase,
      title: data.title,
      clientId: data.clientId,
      practiceArea: data.practiceArea,
      status: data.status,
      description: data.description,
      assignedTo: data.assignedAttorneys,
      priority: data.priority,
      budget: data.budget,
      updatedAt: new Date().toISOString(),
    };

    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setShowEditCaseDialog(false);
    setEditingCase(null);

    toast({
      title: "Case Updated",
      description: `Case "${data.title}" has been updated successfully.`,
    });
  };

  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  if (selectedCase) {
    return (
      <DashboardLayout title={selectedCase.title}>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCase(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Cases
          </Button>
        </div>
        <CaseDetailView 
          case={{
            ...selectedCase,
            client: getClientName(selectedCase.clientId),
            phase: selectedCase.practiceArea,
            progress: 75, // Default progress for demo
            clientCanView: true,
            clientCanComment: true,
            totalBudget: selectedCase.budget || 50000,
            currentExpenses: 12500,
            remainingBudget: (selectedCase.budget || 50000) - 12500
          }} 
          onUpdate={(updatedCase) => setSelectedCase(updatedCase)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cases">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Cases</h2>
          <p className="text-muted-foreground">
            Track and manage all your legal cases
          </p>
        </div>
        <Button onClick={() => setShowNewCaseDialog(true)}>
          <FolderPlus size={16} className="mr-2" />
          New Case
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search cases..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{caseItem.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(caseItem.priority)}>
                    {caseItem.priority}
                  </Badge>
                  <Badge className={getStatusColor(caseItem.status)}>
                    {caseItem.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{getClientName(caseItem.clientId)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Practice Area:</span>
                  <span>{caseItem.practiceArea}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${caseItem.tasks?.length ? (caseItem.tasks.filter(t => t.completed).length / caseItem.tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      {caseItem.tasks?.length ? Math.round((caseItem.tasks.filter(t => t.completed).length / caseItem.tasks.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expenses:</span>
                  <span>{formatCurrency(caseItem.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span>{formatCurrency(caseItem.budget || 0)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCase(caseItem)}
                  className="flex-1"
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditCase(caseItem)}
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No cases found matching your criteria.</p>
        </div>
      )}

      {/* New Case Dialog */}
      <Dialog open={showNewCaseDialog} onOpenChange={setShowNewCaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <CaseForm
            onSubmit={handleCreateCase}
            onCancel={() => setShowNewCaseDialog(false)}
            clients={mockClients} // In a real app, this would come from an API
            attorneys={mockAttorneys} // In a real app, this would come from an API
          />
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={showEditCaseDialog} onOpenChange={setShowEditCaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          {editingCase && (
            <CaseForm
              initialData={{
                title: editingCase.title,
                clientId: editingCase.clientId,
                practiceArea: editingCase.practiceArea,
                status: editingCase.status,
                description: editingCase.description,
                assignedAttorneys: Array.isArray(editingCase.assignedTo) ? editingCase.assignedTo : editingCase.assignedTo ? [editingCase.assignedTo] : [],
                priority: editingCase.priority,
                budget: editingCase.budget
              }}
              onSubmit={handleUpdateCase}
              onCancel={() => setShowEditCaseDialog(false)}
              clients={mockClients}
              attorneys={mockAttorneys}
              submitButtonText="Update Case"
            />
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default Cases;

