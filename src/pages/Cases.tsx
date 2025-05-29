import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  description: string;
  client: string;
  clientId: string;
  clientCanView: boolean;
  clientCanComment: boolean;
  type: string;
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  budget: number;
  expenses: number;
  startDate: string;
  endDate: string;
  opened: string;
  nextHearing?: string;
  practice: string;
  assignedTo: string[];
  phase: string;
  tasks: Task[];
  milestones: Milestone[];
  files: FileItem[];
  notes: Note[];
  comments: Comment[];
  timeEntries: TimeEntry[];
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

const mockCases: Case[] = [
  {
    id: '1',
    title: "Smith v. Jones LLC",
    description: "Corporate litigation case involving breach of contract and intellectual property disputes between Smith Industries and Jones LLC.",
    client: "Sarah Johnson",
    clientId: 'client_1',
    clientCanView: true,
    clientCanComment: true,
    type: "Corporate Litigation",
    status: "active",
    priority: "high",
    progress: 65,
    budget: 150000,
    expenses: 45000,
    startDate: "2023-04-12",
    endDate: "2024-01-15",
    opened: "Apr 12, 2023",
    nextHearing: "Jun 15, 2023",
    practice: "Corporate",
    assignedTo: ["John Doe", "Jane Smith"],
    phase: "Discovery",
    tasks: [],
    milestones: [],
    files: [],
    notes: [],
    comments: [],
    timeEntries: [],
    activities: []
  },
  {
    id: '2',
    title: "Davidson Estate Planning",
    description: "Comprehensive estate planning including will preparation, trust establishment, and tax optimization strategies.",
    client: "Robert Davidson",
    clientId: 'client_2',
    clientCanView: true,
    clientCanComment: false,
    type: "Estate Planning",
    status: "pending",
    priority: "medium",
    progress: 30,
    budget: 25000,
    expenses: 5000,
    startDate: "2023-04-15",
    endDate: "2023-08-15",
    opened: "Apr 15, 2023",
    practice: "Estate",
    assignedTo: ["Alice Johnson"],
    phase: "Planning",
    tasks: [],
    milestones: [],
    files: [],
    notes: [],
    comments: [],
    timeEntries: [],
    activities: []
  },
  {
    id: '3',
    title: "Westlake Merger",
    description: "M&A transaction involving due diligence, regulatory approval, and contract negotiation for Westlake Corp acquisition.",
    client: "Michael Chen",
    clientId: 'client_3',
    clientCanView: false,
    clientCanComment: false,
    type: "M&A",
    status: "active",
    priority: "urgent",
    progress: 80,
    budget: 500000,
    expenses: 120000,
    startDate: "2023-04-18",
    endDate: "2023-12-31",
    opened: "Apr 18, 2023",
    practice: "Corporate",
    assignedTo: ["John Doe", "Bob Wilson", "Carol Brown"],
    phase: "Due Diligence",
    tasks: [],
    milestones: [],
    files: [],
    notes: [],
    comments: [],
    timeEntries: [],
    activities: []
  }
];

const Cases = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.practice.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          case={selectedCase} 
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
        <Button>
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
                  <span className="font-medium">{caseItem.client}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Practice Area:</span>
                  <span>{caseItem.practice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span>{caseItem.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${caseItem.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span>{formatCurrency(caseItem.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expenses:</span>
                  <span>{formatCurrency(caseItem.expenses)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phase:</span>
                  <span>{caseItem.phase}</span>
                </div>
                {caseItem.nextHearing && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Hearing:</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {caseItem.nextHearing}
                    </span>
                  </div>
                )}
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
                <Button variant="outline" size="sm" className="flex-1">
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
    </DashboardLayout>
  );
};

export default Cases;
