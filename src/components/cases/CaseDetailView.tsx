import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Target,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  StickyNote,
  MessageSquare,
  Receipt,
  Play,
  Pause,
  Timer,
  CheckCircle,
  AlertCircle,
  User,
  Download,
  BarChart3,
  Activity,
  Send,
  Eye
} from 'lucide-react';
import { TaskDialog } from './TaskDialog';
import { MilestoneDialog } from './MilestoneDialog';
import { GanttChart } from './GanttChart';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CaseDetailViewProps {
  case: any;
  onUpdate: (updatedCase: any) => void;
}

export function CaseDetailView({ case: caseData, onUpdate }: CaseDetailViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<any>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', type: 'general' });
  const [newComment, setNewComment] = useState('');
  const [showEditCaseDialog, setShowEditCaseDialog] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<any>(null);
  const [activeClocks, setActiveClocks] = useState<any[]>([]);

  // Mock data for demonstration
  const mockTasks = [
    {
      id: '1',
      title: 'Review contract documents',
      description: 'Review and analyze merger agreement documents for potential issues',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      createdDate: '2024-01-10',
      estimatedHours: 8,
      actualHours: 4.5
    },
    {
      id: '2',
      title: 'Client meeting preparation',
      description: 'Prepare agenda and materials for upcoming client meeting',
      status: 'pending',
      priority: 'medium',
      assignee: 'Jane Smith',
      dueDate: '2024-02-10',
      createdDate: '2024-01-08',
      estimatedHours: 3,
      actualHours: 0
    }
  ];

  const mockMilestones = [
    {
      id: '1',
      title: 'Discovery Phase Complete',
      description: 'Complete all discovery activities and document review',
      targetDate: '2024-03-01',
      status: 'in-progress',
      tasks: ['1', '2']
    },
    {
      id: '2',
      title: 'Regulatory Filing Submitted',
      description: 'Submit all required regulatory filings for merger approval',
      targetDate: '2024-04-15',
      status: 'upcoming',
      tasks: []
    }
  ];

  const mockFiles = [
    {
      id: '1',
      name: 'merger_agreement_draft.pdf',
      type: 'PDF',
      size: 2048000,
      uploadedBy: 'John Doe',
      uploadedDate: '2024-01-15',
      url: '#'
    },
    {
      id: '2',
      name: 'due_diligence_checklist.xlsx',
      type: 'Excel',
      size: 512000,
      uploadedBy: 'Jane Smith',
      uploadedDate: '2024-01-12',
      url: '#'
    }
  ];

  const mockNotes = [
    {
      id: '1',
      title: 'Client Meeting Notes',
      content: 'Discussed timeline concerns and budget adjustments. Client requested expedited review.',
      type: 'meeting',
      createdBy: 'John Doe',
      createdDate: '2024-01-14',
      isPrivate: false
    }
  ];

  const mockComments = [
    {
      id: '1',
      content: 'Please prioritize the contract review as we have a tight deadline.',
      author: 'Sarah Johnson',
      createdDate: '2024-01-13',
      isClient: true
    }
  ];

  const mockTimeEntries = [
    {
      id: '1',
      description: 'Contract document review',
      hours: 3.5,
      date: '2024-01-15',
      rate: 250,
      billable: true,
      employee: 'John Doe',
      task: 'Review contract documents'
    },
    {
      id: '2',
      description: 'Client consultation call',
      hours: 1,
      date: '2024-01-14',
      rate: 250,
      billable: true,
      employee: 'Jane Smith'
    }
  ];

  const mockClocks = [
    {
      id: '1',
      name: 'Research Clock',
      startTime: '2024-01-15T09:00:00',
      duration: 7200, // 2 hours in seconds
      isRunning: false,
      description: 'Legal research for case precedents'
    },
    {
      id: '2',
      name: 'Document Review Clock',
      startTime: '2024-01-15T14:00:00',
      duration: 3600, // 1 hour in seconds
      isRunning: true,
      description: 'Reviewing contract documents'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setCurrentTimeEntry({
      id: Date.now().toString(),
      startTime: new Date(),
      description: '',
      task: ''
    });
  };

  const stopTimer = () => {
    if (currentTimeEntry) {
      const endTime = new Date();
      const hours = (endTime.getTime() - currentTimeEntry.startTime.getTime()) / (1000 * 60 * 60);
      
      toast({
        title: "Time Entry Saved",
        description: `Logged ${hours.toFixed(2)} hours for this session.`
      });
    }
    setIsTimerRunning(false);
    setCurrentTimeEntry(null);
  };

  const handleEditCase = () => {
    toast({
      title: "Edit Case",
      description: "Opening case edit dialog...",
    });
    setShowEditCaseDialog(true);
    // In a real app, this would open an edit dialog
  };

  const handleFileUpload = () => {
    toast({
      title: "Upload File",
      description: "Opening file upload dialog...",
    });
    setShowFileUploadDialog(true);
    // In a real app, this would open a file upload dialog
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Create Invoice",
      description: "Opening invoice creation dialog...",
    });
    setShowInvoiceDialog(true);
    // In a real app, this would open an invoice creation dialog
  };

  const handleAddTimeEntry = () => {
    setEditingTimeEntry(null);
    setShowTimeEntryDialog(true);
    toast({
      title: "Add Time Entry",
      description: "Opening time entry dialog...",
    });
  };

  const handleEditTimeEntry = (entry: any) => {
    setEditingTimeEntry(entry);
    setShowTimeEntryDialog(true);
    toast({
      title: "Edit Time Entry",
      description: `Editing time entry: ${entry.description}`,
    });
  };

  const handleDeleteTimeEntry = (entry: any) => {
    toast({
      title: "Delete Time Entry",
      description: `Deleted time entry: ${entry.description}`,
      variant: "destructive",
    });
  };

  const handleStartClock = (clockName: string) => {
    const newClock = {
      id: Date.now().toString(),
      name: clockName,
      startTime: new Date().toISOString(),
      duration: 0,
      isRunning: true,
      description: ''
    };
    setActiveClocks([...activeClocks, newClock]);
    toast({
      title: "Clock Started",
      description: `Started ${clockName}`,
    });
  };

  const handleStopClock = (clockId: string) => {
    setActiveClocks(activeClocks.map(clock => 
      clock.id === clockId ? { ...clock, isRunning: false } : clock
    ));
    toast({
      title: "Clock Stopped",
      description: "Time has been logged.",
    });
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleSaveTask = (taskData: any) => {
    // In real app, this would update the case data
    toast({
      title: "Task Saved",
      description: `Task "${taskData.title}" has been saved successfully.`
    });
  };

  const handleCreateMilestone = () => {
    setEditingMilestone(null);
    setShowMilestoneDialog(true);
  };

  const handleSaveMilestone = (milestoneData: any) => {
    // In real app, this would update the case data
    toast({
      title: "Milestone Saved",
      description: `Milestone "${milestoneData.title}" has been saved successfully.`
    });
  };

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content for the note.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Note Created",
      description: `Note "${newNote.title}" has been created successfully.`
    });
    
    setNewNote({ title: '', content: '', type: 'general' });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toast({
      title: "Comment Added",
      description: "Your comment has been posted."
    });
    
    setNewComment('');
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{caseData.title}</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Client: {caseData.client}</span>
            <span>•</span>
            <span>Phase: {caseData.phase}</span>
            <span>•</span>
            <span>Progress: {caseData.progress}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isTimerRunning ? (
            <Button onClick={stopTimer} variant="destructive">
              <Pause size={16} className="mr-2" />
              Stop Timer
            </Button>
          ) : (
            <Button onClick={startTimer}>
              <Play size={16} className="mr-2" />
              Start Timer
            </Button>
          )}
          <Button variant="outline" onClick={handleEditCase}>
            <Edit size={16} className="mr-2" />
            Edit Case
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="thread">Thread</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="clocks">Clocks</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
        </TabsList>

        {/* Case Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Case Title</Label>
                    <p className="font-medium">{caseData.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge className="bg-green-100 text-green-800">{caseData.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <Badge className="bg-red-100 text-red-800">{caseData.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phase</Label>
                    <p>{caseData.phase}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                    <p>{formatDate(caseData.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">End Date</Label>
                    <p>{formatDate(caseData.endDate)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-sm text-gray-700">{caseData.description}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Progress</Label>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{caseData.progress}% Complete</span>
                      <span>{100 - caseData.progress}% Remaining</span>
                    </div>
                    <Progress value={caseData.progress} className="w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                  <div className="flex flex-wrap gap-2">
                    {caseData.assignedTo.map((person: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <User size={12} />
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Client Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={18} />
                    Budget Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Budget:</span>
                      <span className="font-medium">{formatCurrency(caseData.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expenses:</span>
                      <span className="font-medium text-red-600">{formatCurrency(caseData.expenses)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Remaining:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(caseData.budget - caseData.expenses)}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Client Name</Label>
                    <p className="font-medium">{caseData.client}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={caseData.clientCanView} />
                      <Label className="text-sm">Client Can View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={caseData.clientCanComment} />
                      <Label className="text-sm">Client Can Comment</Label>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Calendar size={16} className="mr-2" />
                    Link to Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gantt Chart in Summary */}
          <div className="mt-6">
            <GanttChart 
              tasks={mockTasks.map(task => ({
                ...task,
                startDate: task.createdDate,
                endDate: task.dueDate,
                progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0
              }))}
              milestones={mockMilestones}
            />
          </div>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Task Management</h3>
            <Button onClick={handleCreateTask}>
              <Plus size={16} className="mr-2" />
              Create New Task
            </Button>
          </div>
          
          <div className="grid gap-4">
            {mockTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Assignee: {task.assignee}</span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                        <span>Est: {task.estimatedHours}h</span>
                        <span>Actual: {task.actualHours}h</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Milestones</h3>
            <Button onClick={handleCreateMilestone}>
              <Plus size={16} className="mr-2" />
              Add Milestone
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockMilestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-blue-500" />
                        <h4 className="font-medium">{milestone.title}</h4>
                        <Badge className={milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Target: {formatDate(milestone.targetDate)}</span>
                        <span>Tasks: {milestone.tasks.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Log Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Activities Log</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Case created</span> by Admin
                </p>
                <p className="text-xs text-gray-500">{formatDate(caseData.startDate)}</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">New task created</span> - Review contract documents
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">File uploaded</span> - merger_agreement_draft.pdf
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Files</h3>
            <Button onClick={handleFileUpload}>
              <Upload size={16} className="mr-2" />
              Upload New File
            </Button>
          </div>
          
          <div className="grid gap-4">
            {mockFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {formatDate(file.uploadedDate)} by {file.uploadedBy} • {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notes</h3>
          </div>
          
          {/* Create New Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Note title..."
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newNote.type}
                    onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="meeting">Meeting</option>
                    <option value="research">Research</option>
                    <option value="strategy">Strategy</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Note content..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveNote}>
                <StickyNote size={16} className="mr-2" />
                Save Note
              </Button>
            </CardContent>
          </Card>
          
          {/* Existing Notes */}
          <div className="grid gap-4">
            {mockNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{note.title}</h4>
                      <Badge variant="secondary">{note.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{note.content}</p>
                    <p className="text-xs text-gray-500">
                      Created {formatDate(note.createdDate)} by {note.createdBy}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comments</h3>
          </div>
          
          {/* Add New Comment */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button onClick={handleAddComment}>
                  <Send size={16} className="mr-2" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Existing Comments */}
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span className="font-medium">{comment.author}</span>
                        {comment.isClient && (
                          <Badge variant="outline" className="text-xs">Client</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Time Tracking</h3>
            {isTimerRunning ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                  <Timer size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Timer Running</span>
                </div>
                <Button onClick={stopTimer} variant="destructive" size="sm">
                  <Pause size={16} className="mr-2" />
                  Stop
                </Button>
              </div>
            ) : (
              <Button onClick={startTimer}>
                <Play size={16} className="mr-2" />
                Start Timer
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="font-medium">Today's Time</span>
                  </div>
                  <span className="text-2xl font-bold">3h 45m</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-green-500" />
                    <span className="font-medium">This Week</span>
                  </div>
                  <span className="text-2xl font-bold">24h 30m</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-medium">Total Billable</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">156h 15m</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timesheet Tab */}
        <TabsContent value="timesheet" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Time Sheet</h3>
            <Button onClick={handleAddTimeEntry}>
              <Plus size={16} className="mr-2" />
              Add Time Entry
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTimeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.employee}</TableCell>
                      <TableCell>{entry.hours}h</TableCell>
                      <TableCell>{formatCurrency(entry.rate)}</TableCell>
                      <TableCell>{formatCurrency(entry.hours * entry.rate)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.billable ? "default" : "secondary"}>
                          {entry.billable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditTimeEntry(entry)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTimeEntry(entry)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other placeholder tabs */}
        <TabsContent value="thread">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thread Communication</h3>
              <p className="text-gray-500 mb-4">Real-time communication thread for case discussions.</p>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm"><strong>John Doe:</strong> Updated the contract review timeline.</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm"><strong>Client:</strong> When can we expect the first draft?</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Case Invoices</h3>
              <p className="text-gray-500">Integration with invoice system - view and manage invoices related to this case.</p>
              <Button className="mt-4" onClick={handleCreateInvoice}>
                <Receipt size={16} className="mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clocks">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Clock Management</h3>
              <div className="flex gap-2">
                <Button onClick={() => handleStartClock('Research Clock')} size="sm">
                  <Plus size={16} className="mr-2" />
                  Research Clock
                </Button>
                <Button onClick={() => handleStartClock('Document Review Clock')} size="sm">
                  <Plus size={16} className="mr-2" />
                  Document Clock
                </Button>
                <Button onClick={() => handleStartClock('Meeting Clock')} size="sm">
                  <Plus size={16} className="mr-2" />
                  Meeting Clock
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {[...mockClocks, ...activeClocks].map((clock) => (
                <Card key={clock.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className={clock.isRunning ? "text-green-500" : "text-gray-500"} />
                          <h4 className="font-medium">{clock.name}</h4>
                          {clock.isRunning && (
                            <Badge className="bg-green-100 text-green-800">Running</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{clock.description || 'No description'}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Started: {formatDate(clock.startTime)}</span>
                          <span>Duration: {formatDuration(clock.duration)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {clock.isRunning ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleStopClock(clock.id)}
                          >
                            <Pause size={14} className="mr-1" />
                            Stop
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartClock(clock.name)}
                          >
                            <Play size={14} className="mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {[...mockClocks, ...activeClocks].length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No active clocks. Start a new clock to track time for specific activities.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onSave={handleSaveTask}
        task={editingTask}
        caseId={caseData.id}
      />

      <MilestoneDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
        onSave={handleSaveMilestone}
        milestone={editingMilestone}
        caseId={caseData.id}
        availableTasks={mockTasks}
      />

      {/* Edit Case Dialog */}
      <Dialog open={showEditCaseDialog} onOpenChange={setShowEditCaseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Case Title</Label>
                <Input defaultValue={caseData.title} placeholder="Enter case title..." />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={caseData.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select defaultValue={caseData.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget</Label>
                <Input type="number" defaultValue={caseData.budget} placeholder="Enter budget..." />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={caseData.description} placeholder="Enter case description..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditCaseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Case Updated",
                  description: "Case details have been updated successfully.",
                });
                setShowEditCaseDialog(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Choose files to upload</h3>
              <p className="text-gray-500 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <Input type="file" multiple className="hidden" id="file-upload" />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFileUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Files Uploaded",
                  description: "Files have been uploaded successfully.",
                });
                setShowFileUploadDialog(false);
              }}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Creation Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input defaultValue={`INV-${Date.now()}`} placeholder="Invoice number..." />
              </div>
              <div>
                <Label>Invoice Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="Enter amount..." />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Enter invoice description..." rows={3} />
            </div>
            <div>
              <Label>Line Items</Label>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <Input placeholder="Description" className="flex-1" />
                  <Input placeholder="Hours" className="w-24" type="number" />
                  <Input placeholder="Rate" className="w-24" type="number" />
                  <Button size="sm" variant="ghost">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus size={14} className="mr-2" />
                  Add Line Item
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Invoice Created",
                  description: "Invoice has been created successfully.",
                });
                setShowInvoiceDialog(false);
              }}>
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Entry Dialog */}
      <Dialog open={showTimeEntryDialog} onOpenChange={setShowTimeEntryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTimeEntry ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Description</Label>
              <Input 
                defaultValue={editingTimeEntry?.description} 
                placeholder="What did you work on?" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  defaultValue={editingTimeEntry?.date || new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div>
                <Label>Hours</Label>
                <Input 
                  type="number" 
                  step="0.25" 
                  defaultValue={editingTimeEntry?.hours || ''} 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label>Rate ($/hr)</Label>
                <Input 
                  type="number" 
                  defaultValue={editingTimeEntry?.rate || 250} 
                  placeholder="250" 
                />
              </div>
              <div>
                <Label>Billable</Label>
                <Select defaultValue={editingTimeEntry?.billable ? 'yes' : 'no'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Task (Optional)</Label>
              <Select defaultValue={editingTimeEntry?.task || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific task</SelectItem>
                  {mockTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowTimeEntryDialog(false);
                setEditingTimeEntry(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: editingTimeEntry ? "Time Entry Updated" : "Time Entry Added",
                  description: editingTimeEntry ? "Time entry has been updated." : "Time entry has been added.",
                });
                setShowTimeEntryDialog(false);
                setEditingTimeEntry(null);
              }}>
                {editingTimeEntry ? 'Update' : 'Add'} Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 