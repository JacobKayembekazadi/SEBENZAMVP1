import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  Receipt,
  Play,
  Pause,
  Timer,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Download,
  BarChart3,
  Activity,
  Send,
  Eye,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { TaskDialog } from './TaskDialog';
import { MilestoneDialog } from './MilestoneDialog';
import { GanttChart } from './GanttChart';
import { EditCaseDialog } from './EditCaseDialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CaseDetailViewProps {
  case: any;
  onUpdate: (updatedCase: any) => void;
}

export function CaseDetailView({ case: caseData, onUpdate }: CaseDetailViewProps) {
  const { toast } = useToast();
  
  // Mock data for demonstration - moved to top to avoid hoisting issues
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

  // State declarations
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
  const [isEditingCaseInfo, setIsEditingCaseInfo] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingClientInfo, setIsEditingClientInfo] = useState(false);
  const [localCaseData, setLocalCaseData] = useState(caseData);
  
  // Enhanced tab state management
  const [tasks, setTasks] = useState(mockTasks);
  const [milestones, setMilestones] = useState(mockMilestones);
  const [files, setFiles] = useState(mockFiles);
  const [isUploading, setIsUploading] = useState(false);

  // Enhanced state for all CRUD tabs
  const [notes, setNotes] = useState(mockNotes);
  const [comments, setComments] = useState(mockComments);
  const [clocks, setClocks] = useState(mockClocks);
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);
  const [invoices, setInvoices] = useState([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      amount: 8750.00,
      status: 'sent',
      dueDate: '2024-02-15',
      createdDate: '2024-01-15',
      description: 'Legal services for January 2024',
      lineItems: [
        { description: 'Document Review', hours: 15, rate: 250, amount: 3750 },
        { description: 'Client Consultation', hours: 5, rate: 300, amount: 1500 },
        { description: 'Court Filing', hours: 10, rate: 350, amount: 3500 }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      amount: 5250.00,
      status: 'draft',
      dueDate: '2024-03-01',
      createdDate: '2024-02-01',
      description: 'Legal services for February 2024',
      lineItems: [
        { description: 'Legal Research', hours: 12, rate: 200, amount: 2400 },
        { description: 'Drafting Documents', hours: 8, rate: 300, amount: 2400 },
        { description: 'Administrative Tasks', hours: 3, rate: 150, amount: 450 }
      ]
    }
  ]);

  // Enhanced state for time tracking sessions
  const [trackingSessions, setTrackingSessions] = useState([
    {
      id: '1',
      title: 'Document Review Session',
      description: 'Reviewing merger agreement documents',
      startTime: '2024-01-15T09:00:00',
      endTime: '2024-01-15T12:30:00',
      duration: 12600, // 3.5 hours in seconds
      isActive: false,
      category: 'Research',
      billable: true,
      rate: 250,
      employee: 'John Doe',
      tags: ['merger', 'documents', 'review']
    },
    {
      id: '2',
      title: 'Client Consultation',
      description: 'Discussion with client about timeline and strategy',
      startTime: '2024-01-15T14:00:00',
      endTime: null,
      duration: 3600, // 1 hour so far
      isActive: true,
      category: 'Meeting',
      billable: true,
      rate: 300,
      employee: 'Jane Smith',
      tags: ['client', 'consultation', 'strategy']
    }
  ]);

  // Dialog states for CRUD operations
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showClockDialog, setShowClockDialog] = useState(false);
  const [showInvoiceDetailDialog, setShowInvoiceDetailDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editingClock, setEditingClock] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [clockFilter, setClockFilter] = useState('all');
  const [noteFilter, setNoteFilter] = useState('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');

  // Enhanced tracking session states
  const [showTrackingSessionDialog, setShowTrackingSessionDialog] = useState(false);
  const [editingTrackingSession, setEditingTrackingSession] = useState<any>(null);
  const [trackingFilter, setTrackingFilter] = useState('all');

  // Additional state variables (duplicates removed - already declared above)

  // Sync localCaseData with props changes
  useEffect(() => {
    setLocalCaseData(caseData);
  }, [caseData]);

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

  // Summary tab CRUD functions
  const saveCaseInfo = async () => {
    try {
      // In a real app, call API to update case
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onUpdate(localCaseData);
      setIsEditingCaseInfo(false);
      
      toast({
        title: "Case Updated",
        description: "Case information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case information.",
        variant: "destructive",
      });
    }
  };

  const saveBudgetInfo = async () => {
    try {
      // In a real app, call API to update budget
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onUpdate(localCaseData);
      setIsEditingBudget(false);
      
      toast({
        title: "Budget Updated",
        description: "Budget information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget information.",
        variant: "destructive",
      });
    }
  };

  const saveClientInfo = async () => {
    try {
      // In a real app, call API to update client info
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onUpdate(localCaseData);
      setIsEditingClientInfo(false);
      
      toast({
        title: "Client Info Updated",
        description: "Client information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client information.",
        variant: "destructive",
      });
    }
  };

  const removeAssignee = (person: string) => {
    setLocalCaseData({
      ...localCaseData,
      assignedTo: localCaseData.assignedTo?.filter(p => p !== person) || []
    });
  };

  const addAssignee = () => {
    // In a real app, this would open a dialog to select from available attorneys
    const newAssignee = prompt('Enter attorney name:');
    if (newAssignee && !localCaseData.assignedTo?.includes(newAssignee)) {
      setLocalCaseData({
        ...localCaseData,
        assignedTo: [...(localCaseData.assignedTo || []), newAssignee]
      });
    }
  };

  // Enhanced Add Expense Handler
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseDialog(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setShowExpenseDialog(true);
  };

  const handleSaveExpense = (expenseData: any) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(prev => prev.map(expense => 
        expense.id === editingExpense.id 
          ? { ...expense, ...expenseData, id: editingExpense.id }
          : expense
      ));
      toast({
        title: "Expense Updated",
        description: `Expense "${expenseData.description}" has been updated successfully.`,
      });
    } else {
      // Create new expense
      const newExpense = {
        id: Date.now().toString(),
        ...expenseData,
        status: 'pending'
      };
      setExpenses(prev => [newExpense, ...prev]);
      toast({
        title: "Expense Added",
        description: `New expense "${expenseData.description}" has been added successfully.`,
      });
    }
    setShowExpenseDialog(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "The expense has been deleted successfully.",
      variant: "destructive"
    });
  };

  // Enhanced Contact Client Handler
  const handleContactClient = () => {
    setEditingContact(null);
    setShowContactClientDialog(true);
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setShowContactClientDialog(true);
  };

  const handleSaveContact = (contactData: any) => {
    if (editingContact) {
      // Update existing contact
      setClientContacts(prev => prev.map(contact => 
        contact.id === editingContact.id 
          ? { ...contact, ...contactData, id: editingContact.id }
          : contact
      ));
      toast({
        title: "Contact Updated",
        description: `Contact "${contactData.subject}" has been updated successfully.`,
      });
    } else {
      // Create new contact
      const newContact = {
        id: Date.now().toString(),
        ...contactData,
        sentDate: new Date().toISOString(),
        status: contactData.type === 'email' ? 'sent' : 'completed'
      };
      setClientContacts(prev => [newContact, ...prev]);
      toast({
        title: "Contact Logged",
        description: `New ${contactData.type} "${contactData.subject}" has been logged successfully.`,
      });
    }
    setShowContactClientDialog(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    setClientContacts(prev => prev.filter(contact => contact.id !== contactId));
    toast({
      title: "Contact Deleted",
      description: "The contact record has been deleted successfully.",
      variant: "destructive"
    });
  };

  // Enhanced Schedule Meeting Handler
  const handleScheduleMeeting = () => {
    setEditingMeeting(null);
    setShowScheduleMeetingDialog(true);
  };

  const handleEditMeeting = (meeting: any) => {
    setEditingMeeting(meeting);
    setShowScheduleMeetingDialog(true);
  };

  const handleSaveMeeting = (meetingData: any) => {
    if (editingMeeting) {
      // Update existing meeting
      setMeetings(prev => prev.map(meeting => 
        meeting.id === editingMeeting.id 
          ? { ...meeting, ...meetingData, id: editingMeeting.id }
          : meeting
      ));
      toast({
        title: "Meeting Updated",
        description: `Meeting "${meetingData.title}" has been updated successfully.`,
      });
    } else {
      // Create new meeting
      const newMeeting = {
        id: Date.now().toString(),
        ...meetingData,
        status: 'scheduled'
      };
      setMeetings(prev => [newMeeting, ...prev]);
      toast({
        title: "Meeting Scheduled",
        description: `Meeting "${meetingData.title}" has been scheduled successfully.`,
      });
    }
    setShowScheduleMeetingDialog(false);
    setEditingMeeting(null);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    toast({
      title: "Meeting Cancelled",
      description: "The meeting has been cancelled successfully.",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced Tasks CRUD functions
  const handleCreateNewTask = () => {
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleEditTaskDetails = (task: any) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleSaveTaskDetails = (taskData: any) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...taskData, id: editingTask.id } : task
      ));
      toast({
        title: "Task Updated",
        description: `Task "${taskData.title}" has been updated successfully.`
      });
    } else {
      // Create new task
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        createdDate: new Date().toISOString().split('T')[0],
        actualHours: 0
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Task Created",
        description: `Task "${taskData.title}" has been created successfully.`
      });
    }
    setShowTaskDialog(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in-progress' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  // Enhanced Milestones CRUD functions
  const handleCreateNewMilestone = () => {
    setEditingMilestone(null);
    setShowMilestoneDialog(true);
  };

  const handleEditMilestoneDetails = (milestone: any) => {
    setEditingMilestone(milestone);
    setShowMilestoneDialog(true);
  };

  const handleSaveMilestoneDetails = (milestoneData: any) => {
    if (editingMilestone) {
      // Update existing milestone
      setMilestones(milestones.map(milestone => 
        milestone.id === editingMilestone.id ? { ...milestone, ...milestoneData, id: editingMilestone.id } : milestone
      ));
      toast({
        title: "Milestone Updated",
        description: `Milestone "${milestoneData.title}" has been updated successfully.`
      });
    } else {
      // Create new milestone
      const newMilestone = {
        ...milestoneData,
        id: Date.now().toString(),
        status: 'upcoming',
        tasks: []
      };
      setMilestones([...milestones, newMilestone]);
      toast({
        title: "Milestone Created",
        description: `Milestone "${milestoneData.title}" has been created successfully.`
      });
    }
    setShowMilestoneDialog(false);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== milestoneId));
    toast({
      title: "Milestone Deleted",
      description: "Milestone has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleToggleMilestoneStatus = (milestoneId: string) => {
    setMilestones(milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        const newStatus = milestone.status === 'completed' ? 'upcoming' : 'completed';
        return { ...milestone, status: newStatus };
      }
      return milestone;
    }));
  };

  // Enhanced Files CRUD functions
  const handleFileUploadNew = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFiles = Array.from(fileList).map((file, index) => ({
        id: (Date.now() + index).toString(),
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        size: file.size,
        uploadedBy: 'Current User',
        uploadedDate: new Date().toISOString(),
        url: '#'
      }));

      setFiles([...files, ...newFiles]);
      
      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) uploaded successfully.`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    setFiles(files.filter(f => f.id !== fileId));
    
    toast({
      title: "File Deleted",
      description: `"${file?.name}" has been deleted successfully.`,
      variant: "destructive"
    });
  };

  const handleDownloadFile = (file: any) => {
    // In a real app, this would trigger actual download
    toast({
      title: "Download Started",
      description: `Downloading "${file.name}"`
    });
  };

  const handlePreviewFile = (file: any) => {
    toast({
      title: "Preview File",
      description: `Opening preview for ${file.name}`,
    });
    // Implement file preview logic
  };

  // CRUD Handlers for Notes
  const handleCreateNewNote = () => {
    setEditingNote(null);
    setShowNoteDialog(true);
  };

  const handleEditNoteDetails = (note: any) => {
    setEditingNote(note);
    setShowNoteDialog(true);
  };

  const handleSaveNoteDetails = (noteData: any) => {
    if (editingNote) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData, updatedDate: new Date().toISOString() }
          : note
      ));
      toast({
        title: "Note Updated",
        description: "Note has been successfully updated",
      });
    } else {
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdBy: "Current User",
        createdDate: new Date().toISOString(),
        isPrivate: false
      };
      setNotes(prev => [newNote, ...prev]);
      toast({
        title: "Note Created",
        description: "New note has been created successfully",
      });
    }
    setShowNoteDialog(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    if (noteToDelete) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Note Deleted",
        description: `"${noteToDelete.title}" has been deleted`,
        variant: "destructive"
      });
    }
  };

  // CRUD Handlers for Comments
  const handleCreateNewComment = () => {
    setEditingComment(null);
    setShowCommentDialog(true);
  };

  const handleEditCommentDetails = (comment: any) => {
    setEditingComment(comment);
    setShowCommentDialog(true);
  };

  const handleSaveCommentDetails = (commentData: any) => {
    if (editingComment) {
      // Update existing comment
      setComments(prev => prev.map(comment => 
        comment.id === editingComment.id 
          ? { ...comment, ...commentData, updatedDate: new Date().toISOString() }
          : comment
      ));
      toast({
        title: "Comment Updated",
        description: "Comment has been successfully updated",
      });
    } else {
      // Create new comment
      const newComment = {
        id: Date.now().toString(),
        ...commentData,
        author: "Current User",
        createdDate: new Date().toISOString(),
        isClient: false
      };
      setComments(prev => [newComment, ...prev]);
      toast({
        title: "Comment Added",
        description: "New comment has been added successfully",
      });
    }
    setShowCommentDialog(false);
    setEditingComment(null);
  };

  const handleDeleteComment = (commentId: string) => {
    const commentToDelete = comments.find(comment => comment.id === commentId);
    if (commentToDelete) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Comment Deleted",
        description: "Comment has been deleted",
        variant: "destructive"
      });
    }
  };

  // CRUD Handlers for Clocks
  const handleCreateNewClock = () => {
    setEditingClock(null);
    setShowClockDialog(true);
  };

  const handleEditClockDetails = (clock: any) => {
    setEditingClock(clock);
    setShowClockDialog(true);
  };

  const handleSaveClockDetails = (clockData: any) => {
    if (editingClock) {
      // Update existing clock
      setClocks(prev => prev.map(clock => 
        clock.id === editingClock.id 
          ? { ...clock, ...clockData }
          : clock
      ));
      toast({
        title: "Clock Updated",
        description: "Clock has been successfully updated",
      });
    } else {
      // Create new clock
      const newClock = {
        id: Date.now().toString(),
        ...clockData,
        startTime: new Date().toISOString(),
        duration: 0,
        isRunning: false
      };
      setClocks(prev => [newClock, ...prev]);
      toast({
        title: "Clock Created",
        description: "New clock has been created successfully",
      });
    }
    setShowClockDialog(false);
    setEditingClock(null);
  };

  const handleDeleteClock = (clockId: string) => {
    const clockToDelete = clocks.find(clock => clock.id === clockId);
    if (clockToDelete) {
      setClocks(prev => prev.filter(clock => clock.id !== clockId));
      toast({
        title: "Clock Deleted",
        description: `"${clockToDelete.name}" has been deleted`,
        variant: "destructive"
      });
    }
  };

  const handleToggleClockStatus = (clockId: string) => {
    setClocks(prev => prev.map(clock => {
      if (clock.id === clockId) {
        const isCurrentlyRunning = clock.isRunning;
        const now = new Date().toISOString();
        
        if (isCurrentlyRunning) {
          // Stop the clock
          const duration = clock.duration + (Date.now() - new Date(clock.startTime).getTime()) / 1000;
          toast({
            title: "Clock Stopped",
            description: `"${clock.name}" has been stopped`,
          });
          return { ...clock, isRunning: false, duration: Math.floor(duration) };
        } else {
          // Start the clock
          toast({
            title: "Clock Started",
            description: `"${clock.name}" is now running`,
          });
          return { ...clock, isRunning: true, startTime: now };
        }
      }
      return clock;
    }));
  };

  // CRUD Handlers for Invoices
  const handleCreateNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceDetailDialog(true);
  };

  const handleEditInvoiceDetails = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowInvoiceDetailDialog(true);
  };

  const handleSaveInvoiceDetails = (invoiceData: any) => {
    if (editingInvoice) {
      // Update existing invoice
      setInvoices(prev => prev.map(invoice => 
        invoice.id === editingInvoice.id 
          ? { ...invoice, ...invoiceData, updatedDate: new Date().toISOString() }
          : invoice
      ));
      toast({
        title: "Invoice Updated",
        description: "Invoice has been successfully updated",
      });
    } else {
      // Create new invoice
      const newInvoice = {
        id: Date.now().toString(),
        ...invoiceData,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString(),
        status: 'draft'
      };
      setInvoices(prev => [newInvoice, ...prev]);
      toast({
        title: "Invoice Created",
        description: "New invoice has been created successfully",
      });
    }
    setShowInvoiceDetailDialog(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoiceToDelete = invoices.find(invoice => invoice.id === invoiceId);
    if (invoiceToDelete) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoiceToDelete.invoiceNumber} has been deleted`,
        variant: "destructive"
      });
    }
  };

  const handleToggleInvoiceStatus = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const currentStatus = invoice.status;
        let newStatus;
        
        switch (currentStatus) {
          case 'draft':
            newStatus = 'sent';
            break;
          case 'sent':
            newStatus = 'paid';
            break;
          case 'paid':
            newStatus = 'draft';
            break;
          default:
            newStatus = 'draft';
        }
        
        toast({
          title: "Invoice Status Updated",
          description: `Invoice ${invoice.invoiceNumber} status changed to ${newStatus}`,
        });
        
        return { ...invoice, status: newStatus };
      }
      return invoice;
    }));
  };

  // Enhanced Time Entry handlers
  const handleCreateNewTimeEntry = () => {
    setEditingTimeEntry(null);
    setShowTimeEntryDialog(true);
  };

  const handleSaveTimeEntryDetails = (timeEntryData: any) => {
    if (editingTimeEntry) {
      // Update existing time entry
      setTimeEntries(prev => prev.map(entry => 
        entry.id === editingTimeEntry.id 
          ? { ...entry, ...timeEntryData }
          : entry
      ));
      toast({
        title: "Time Entry Updated",
        description: "Time entry has been successfully updated",
      });
    } else {
      // Create new time entry
      const newTimeEntry = {
        id: Date.now().toString(),
        ...timeEntryData,
        employee: "Current User"
      };
      setTimeEntries(prev => [newTimeEntry, ...prev]);
      toast({
        title: "Time Entry Created",
        description: "New time entry has been created successfully",
      });
    }
    setShowTimeEntryDialog(false);
    setEditingTimeEntry(null);
  };

  const handleDeleteTimeEntryEnhanced = (timeEntryId: string) => {
    const entryToDelete = timeEntries.find(entry => entry.id === timeEntryId);
    if (entryToDelete) {
      setTimeEntries(prev => prev.filter(entry => entry.id !== timeEntryId));
      toast({
        title: "Time Entry Deleted",
        description: `Time entry "${entryToDelete.description}" has been deleted`,
        variant: "destructive"
      });
    }
  };

  // Filter functions
  const getFilteredNotes = () => {
    if (noteFilter === 'all') return notes;
    return notes.filter(note => note.type === noteFilter);
  };

  const getFilteredClocks = () => {
    switch (clockFilter) {
      case 'running':
        return clocks.filter(clock => clock.isRunning);
      case 'stopped':
        return clocks.filter(clock => !clock.isRunning);
      default:
        return clocks;
    }
  };

  const getFilteredInvoices = () => {
    if (invoiceFilter === 'all') return invoices;
    return invoices.filter(invoice => invoice.status === invoiceFilter);
  };

  // Status helpers
  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'strategy': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced Time Tracking Session CRUD Handlers
  const handleCreateNewTrackingSession = () => {
    setEditingTrackingSession(null);
    setShowTrackingSessionDialog(true);
  };

  const handleEditTrackingSession = (session: any) => {
    setEditingTrackingSession(session);
    setShowTrackingSessionDialog(true);
  };

  const handleSaveTrackingSession = (sessionData: any) => {
    if (editingTrackingSession) {
      // Update existing session
      setTrackingSessions(prev => prev.map(session => 
        session.id === editingTrackingSession.id 
          ? { ...session, ...sessionData }
          : session
      ));
      toast({
        title: "Session Updated",
        description: "Time tracking session has been successfully updated",
      });
    } else {
      // Create new session
      const newSession = {
        id: Date.now().toString(),
        ...sessionData,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        isActive: false,
        employee: "Current User"
      };
      setTrackingSessions(prev => [newSession, ...prev]);
      toast({
        title: "Session Created",
        description: "New time tracking session has been created successfully",
      });
    }
    setShowTrackingSessionDialog(false);
    setEditingTrackingSession(null);
  };

  const handleDeleteTrackingSession = (sessionId: string) => {
    const sessionToDelete = trackingSessions.find(session => session.id === sessionId);
    if (sessionToDelete) {
      setTrackingSessions(prev => prev.filter(session => session.id !== sessionId));
      toast({
        title: "Session Deleted",
        description: `"${sessionToDelete.title}" has been deleted`,
        variant: "destructive"
      });
    }
  };

  const handleStartTrackingSession = (sessionId: string) => {
    setTrackingSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        if (session.isActive) {
          // Stop the session
          const now = new Date().toISOString();
          const additionalDuration = (Date.now() - new Date(session.startTime).getTime()) / 1000;
          toast({
            title: "Session Stopped",
            description: `"${session.title}" has been stopped`,
          });
          return { 
            ...session, 
            isActive: false, 
            endTime: now,
            duration: session.duration + Math.floor(additionalDuration)
          };
        } else {
          // Start the session
          toast({
            title: "Session Started",
            description: `"${session.title}" is now tracking time`,
          });
          return { 
            ...session, 
            isActive: true, 
            startTime: new Date().toISOString(),
            endTime: null
          };
        }
      }
      return session;
    }));
  };

  const handleConvertToTimeEntry = (sessionId: string) => {
    const session = trackingSessions.find(s => s.id === sessionId);
    if (session && !session.isActive) {
      const newTimeEntry = {
        id: Date.now().toString(),
        description: session.title,
        hours: session.duration / 3600, // Convert seconds to hours
        date: new Date(session.startTime).toISOString().split('T')[0],
        rate: session.rate,
        billable: session.billable,
        employee: session.employee
      };
      
      setTimeEntries(prev => [newTimeEntry, ...prev]);
      setTrackingSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Converted to Time Entry",
        description: `"${session.title}" has been converted to a time entry`,
      });
    }
  };

  // Enhanced tracking filter function
  const getFilteredTrackingSessions = () => {
    switch (trackingFilter) {
      case 'active':
        return trackingSessions.filter(session => session.isActive);
      case 'completed':
        return trackingSessions.filter(session => !session.isActive && session.endTime);
      case 'billable':
        return trackingSessions.filter(session => session.billable);
      case 'non-billable':
        return trackingSessions.filter(session => !session.billable);
      default:
        return trackingSessions;
    }
  };

  // Helper function to get session category color
  const getSessionCategoryColor = (category: string) => {
    switch (category) {
      case 'Research': return 'bg-blue-100 text-blue-800';
      case 'Meeting': return 'bg-green-100 text-green-800';
      case 'Documentation': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-gray-100 text-gray-800';
      case 'Court': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Summary tab CRUD functionality state
  const [expenses, setExpenses] = useState([
    {
      id: '1',
      description: 'Court filing fees',
      amount: 450.00,
      date: '2024-01-15',
      category: 'Legal Fees',
      receipt: 'receipt_001.pdf',
      billable: true,
      status: 'approved'
    },
    {
      id: '2',
      description: 'Expert witness consultation',
      amount: 1200.00,
      date: '2024-01-18',
      category: 'Expert Fees',
      receipt: 'receipt_002.pdf',
      billable: true,
      status: 'pending'
    }
  ]);

  const [clientContacts, setClientContacts] = useState([
    {
      id: '1',
      type: 'email',
      subject: 'Case status update',
      message: 'Dear Mr. Johnson, I wanted to provide you with an update on your case...',
      sentDate: '2024-01-15T14:30:00',
      status: 'sent',
      recipient: 'john.johnson@example.com'
    },
    {
      id: '2',
      type: 'phone',
      subject: 'Discussion about settlement options',
      message: 'Called to discuss potential settlement terms and next steps.',
      sentDate: '2024-01-12T10:15:00',
      status: 'completed',
      recipient: '+1-555-0123'
    }
  ]);

  const [meetings, setMeetings] = useState([
    {
      id: '1',
      title: 'Strategy planning meeting',
      description: 'Discuss case strategy and timeline with client',
      date: '2024-01-20',
      time: '14:00',
      duration: 60, // minutes
      location: 'Conference Room A',
      attendees: ['John Johnson', 'Jane Smith', 'Legal Assistant'],
      type: 'in-person',
      status: 'scheduled',
      reminders: ['1 day', '1 hour']
    },
    {
      id: '2',
      title: 'Document review session',
      description: 'Review merger documents with client',
      date: '2024-01-25',
      time: '10:00',
      duration: 120,
      location: 'Video Conference',
      attendees: ['John Johnson', 'Legal Team'],
      type: 'virtual',
      status: 'scheduled',
      reminders: ['1 day']
    }
  ]);

  // Dialog states for summary tab CRUD operations
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showContactClientDialog, setShowContactClientDialog] = useState(false);
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);

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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Case Information</CardTitle>
                <div className="flex gap-2">
                  {isEditingCaseInfo ? (
                    <>
                      <Button size="sm" onClick={() => saveCaseInfo()}>
                        <CheckCircle size={16} className="mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingCaseInfo(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingCaseInfo(true)}>
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Case Title</Label>
                    {isEditingCaseInfo ? (
                      <Input
                        value={localCaseData.title}
                        onChange={(e) => setLocalCaseData({...localCaseData, title: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{localCaseData.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    {isEditingCaseInfo ? (
                      <Select value={localCaseData.status} onValueChange={(value) => setLocalCaseData({...localCaseData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(localCaseData.status)}>{localCaseData.status}</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    {isEditingCaseInfo ? (
                      <Select value={localCaseData.priority} onValueChange={(value) => setLocalCaseData({...localCaseData, priority: value})}>
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
                    ) : (
                      <Badge className={getPriorityColor(localCaseData.priority)}>{localCaseData.priority}</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Phase</Label>
                    {isEditingCaseInfo ? (
                      <Select value={localCaseData.phase} onValueChange={(value) => setLocalCaseData({...localCaseData, phase: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Discovery">Discovery</SelectItem>
                          <SelectItem value="Investigation">Investigation</SelectItem>
                          <SelectItem value="Negotiation">Negotiation</SelectItem>
                          <SelectItem value="Trial Preparation">Trial Preparation</SelectItem>
                          <SelectItem value="Trial">Trial</SelectItem>
                          <SelectItem value="Settlement">Settlement</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{localCaseData.phase}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                    {isEditingCaseInfo ? (
                      <Input
                        type="date"
                        value={localCaseData.startDate ? new Date(localCaseData.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setLocalCaseData({...localCaseData, startDate: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{formatDate(localCaseData.startDate)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">End Date</Label>
                    {isEditingCaseInfo ? (
                      <Input
                        type="date"
                        value={localCaseData.endDate ? new Date(localCaseData.endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setLocalCaseData({...localCaseData, endDate: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{formatDate(localCaseData.endDate)}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  {isEditingCaseInfo ? (
                    <Textarea
                      value={localCaseData.description}
                      onChange={(e) => setLocalCaseData({...localCaseData, description: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{localCaseData.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Progress</Label>
                  <div className="space-y-1">
                    {isEditingCaseInfo ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={localCaseData.progress}
                          onChange={(e) => setLocalCaseData({...localCaseData, progress: parseInt(e.target.value) || 0})}
                          className="w-20"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span>{localCaseData.progress}% Complete</span>
                        <span>{100 - localCaseData.progress}% Remaining</span>
                      </div>
                    )}
                    <Progress value={localCaseData.progress} className="w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                  <div className="flex flex-wrap gap-2">
                    {localCaseData.assignedTo?.map((person: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <User size={12} />
                        {person}
                        {isEditingCaseInfo && (
                          <button
                            onClick={() => removeAssignee(person)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditingCaseInfo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addAssignee()}
                        className="h-6"
                      >
                        <Plus size={12} className="mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Client Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={18} />
                    Budget Overview
                  </CardTitle>
                  <div className="flex gap-2">
                    {isEditingBudget ? (
                      <>
                        <Button size="sm" onClick={() => saveBudgetInfo()}>
                          <CheckCircle size={16} className="mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingBudget(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditingBudget(true)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Budget:</span>
                      {isEditingBudget ? (
                        <Input
                          type="number"
                          value={localCaseData.budget}
                          onChange={(e) => setLocalCaseData({...localCaseData, budget: parseFloat(e.target.value) || 0})}
                          className="w-32 h-6 text-right"
                        />
                      ) : (
                        <span className="font-medium">{formatCurrency(localCaseData.budget)}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expenses:</span>
                      {isEditingBudget ? (
                        <Input
                          type="number"
                          value={localCaseData.expenses}
                          onChange={(e) => setLocalCaseData({...localCaseData, expenses: parseFloat(e.target.value) || 0})}
                          className="w-32 h-6 text-right"
                        />
                      ) : (
                        <span className="font-medium text-red-600">{formatCurrency(localCaseData.expenses)}</span>
                      )}
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Remaining:</span>
                      <span className={`font-bold ${localCaseData.budget - localCaseData.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(localCaseData.budget - localCaseData.expenses)}
                      </span>
                    </div>
                    {localCaseData.budget > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Budget Used</span>
                          <span>{((localCaseData.expenses / localCaseData.budget) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(localCaseData.expenses / localCaseData.budget) * 100} 
                          className="w-full h-2" 
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleAddExpense()}>
                    <Plus size={16} className="mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Client Information</CardTitle>
                  <div className="flex gap-2">
                    {isEditingClientInfo ? (
                      <>
                        <Button size="sm" onClick={() => saveClientInfo()}>
                          <CheckCircle size={16} className="mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingClientInfo(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditingClientInfo(true)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Client Name</Label>
                    {isEditingClientInfo ? (
                      <Input
                        value={localCaseData.client}
                        onChange={(e) => setLocalCaseData({...localCaseData, client: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{localCaseData.client}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={localCaseData.clientCanView} 
                        onCheckedChange={(checked) => setLocalCaseData({...localCaseData, clientCanView: checked})}
                        disabled={!isEditingClientInfo}
                      />
                      <Label className="text-sm">Client Can View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={localCaseData.clientCanComment} 
                        onCheckedChange={(checked) => setLocalCaseData({...localCaseData, clientCanComment: checked})}
                        disabled={!isEditingClientInfo}
                      />
                      <Label className="text-sm">Client Can Comment</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleContactClient()}>
                      <MessageSquare size={16} className="mr-2" />
                      Contact Client
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleScheduleMeeting()}>
                      <Calendar size={16} className="mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
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
            <div>
              <h3 className="text-lg font-semibold">Task Management</h3>
              <p className="text-sm text-gray-600">{tasks.length} tasks • {tasks.filter(t => t.status === 'completed').length} completed</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewTask}>
                <Plus size={16} className="mr-2" />
                Create New Task
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleToggleTaskStatus(task.id)}
                        />
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <Badge 
                          className={getTaskStatusColor(task.status)}
                          onClick={() => handleToggleTaskStatus(task.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {task.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {formatDate(task.dueDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Est: {task.estimatedHours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer size={12} />
                          Actual: {task.actualHours}h
                        </span>
                      </div>
                      {task.actualHours > task.estimatedHours && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle size={12} />
                          Over estimate by {(task.actualHours - task.estimatedHours).toFixed(1)}h
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTaskDetails(task)}
                        title="Edit task"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                            handleDeleteTask(task.id);
                          }
                        }}
                        title="Delete task"
                        className="hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress bar for task completion */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0}%</span>
                    </div>
                    <Progress 
                      value={task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {tasks.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-sm mb-4">Create your first task to get started</p>
                  <Button onClick={handleCreateNewTask}>
                    <Plus size={16} className="mr-2" />
                    Create First Task
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Milestones</h3>
              <p className="text-sm text-gray-600">{milestones.length} milestones • {milestones.filter(m => m.status === 'completed').length} completed</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter milestones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Milestones</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewMilestone}>
                <Plus size={16} className="mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const isOverdue = new Date(milestone.targetDate) < new Date() && milestone.status !== 'completed';
              const daysUntilTarget = Math.ceil((new Date(milestone.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={milestone.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={milestone.status === 'completed'}
                            onCheckedChange={() => handleToggleMilestoneStatus(milestone.id)}
                          />
                          <Target 
                            size={16} 
                            className={milestone.status === 'completed' ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-blue-500'} 
                          />
                          <h4 className={`font-medium ${milestone.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {milestone.title}
                          </h4>
                          <Badge 
                            className={
                              milestone.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : isOverdue 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }
                            onClick={() => handleToggleMilestoneStatus(milestone.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {milestone.status === 'completed' ? 'completed' : isOverdue ? 'overdue' : milestone.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Target: {formatDate(milestone.targetDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Tasks: {milestone.tasks.length}
                          </span>
                          {daysUntilTarget > 0 && milestone.status !== 'completed' && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Clock size={12} />
                              {daysUntilTarget} days remaining
                            </span>
                          )}
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle size={12} />
                              {Math.abs(daysUntilTarget)} days overdue
                            </span>
                          )}
                        </div>
                        
                        {/* Related tasks preview */}
                        {milestone.tasks.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium">Related tasks: </span>
                            {milestone.tasks.slice(0, 3).map((taskId, index) => {
                              const task = tasks.find(t => t.id === taskId);
                              return task ? (
                                <span key={taskId} className="inline-block mr-2">
                                  {task.title}{index < Math.min(milestone.tasks.length - 1, 2) ? ',' : ''}
                                </span>
                              ) : null;
                            })}
                            {milestone.tasks.length > 3 && (
                              <span className="text-gray-500">+{milestone.tasks.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditMilestoneDetails(milestone)}
                          title="Edit milestone"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${milestone.title}"?`)) {
                              handleDeleteMilestone(milestone.id);
                            }
                          }}
                          title="Delete milestone"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress visualization */}
                    {milestone.tasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Task Completion</span>
                          <span>
                            {Math.round((milestone.tasks.filter(taskId => 
                              tasks.find(t => t.id === taskId)?.status === 'completed'
                            ).length / milestone.tasks.length) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(milestone.tasks.filter(taskId => 
                            tasks.find(t => t.id === taskId)?.status === 'completed'
                          ).length / milestone.tasks.length) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {milestones.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No milestones yet</h3>
                  <p className="text-sm mb-4">Create your first milestone to track important case goals</p>
                  <Button onClick={handleCreateNewMilestone}>
                    <Plus size={16} className="mr-2" />
                    Create First Milestone
                  </Button>
                </div>
              </Card>
            )}
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
            <div>
              <h3 className="text-lg font-semibold">Files</h3>
              <p className="text-sm text-gray-600">
                {files.length} files • {formatFileSize(files.reduce((total, file) => total + file.size, 0))} total
              </p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="doc">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUploadNew(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Drag and drop area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              handleFileUploadNew(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Drop files here to upload</h3>
            <p className="text-gray-500">
              or click the upload button above
            </p>
          </div>
          
          <div className="grid gap-4">
            {files.map((file) => {
              const getFileIcon = (type: string) => {
                switch (type.toUpperCase()) {
                  case 'PDF': return <FileText size={24} className="text-red-500" />;
                  case 'DOC':
                  case 'DOCX': return <FileText size={24} className="text-blue-500" />;
                  case 'XLS':
                  case 'XLSX': return <FileText size={24} className="text-green-500" />;
                  case 'JPG':
                  case 'PNG':
                  case 'GIF': return <FileText size={24} className="text-purple-500" />;
                  default: return <FileText size={24} className="text-gray-500" />;
                }
              };

              return (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {file.uploadedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(file.uploadedDate)}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          title="Download file"
                        >
                          <Download size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreviewFile(file)}
                          title="Preview file"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                              handleDeleteFile(file.id);
                            }
                          }}
                          title="Delete file"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {files.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
                  <p className="text-sm mb-4">Upload documents, images, and other files related to this case</p>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUploadNew(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button>
                      <Upload size={16} className="mr-2" />
                      Upload First File
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Case Notes</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <StickyNote size={16} />
                <span>{getFilteredNotes().length} notes</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={noteFilter} onValueChange={setNoteFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter notes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewNote}>
                <Plus size={16} className="mr-2" />
                Add Note
              </Button>
            </div>
          </div>
          
          {/* Notes Grid */}
          <div className="grid gap-4">
            {getFilteredNotes().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <StickyNote size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No notes found</p>
                  <Button onClick={handleCreateNewNote} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Create your first note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              getFilteredNotes().map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-lg">{note.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getNoteTypeColor(note.type)}>
                            {note.type}
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditNoteDetails(note)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{note.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created {formatDate(note.createdDate)} by {note.createdBy}</span>
                        {note.updatedDate && (
                          <span>Updated {formatDate(note.updatedDate)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle size={16} />
                <span>{comments.length} comments</span>
              </div>
            </div>
            <Button onClick={handleCreateNewComment}>
              <Plus size={16} className="mr-2" />
              Add Comment
            </Button>
          </div>
          
          {/* Comments Feed */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No comments yet</p>
                  <Button onClick={handleCreateNewComment} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Start the conversation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <span className="font-medium">{comment.author}</span>
                          {comment.isClient && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              Client
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdDate)}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCommentDetails(comment)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">{comment.content}</p>
                      {comment.updatedDate && (
                        <p className="text-xs text-gray-400 pl-6">
                          Edited {formatDate(comment.updatedDate)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Time Tracking Sessions</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Timer size={16} />
                <span>{trackingSessions.length} sessions</span>
                <span>•</span>
                <span className="font-medium">
                  {trackingSessions.filter(s => s.isActive).length} active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={trackingFilter} onValueChange={setTrackingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="billable">Billable</SelectItem>
                  <SelectItem value="non-billable">Non-billable</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewTrackingSession}>
                <Plus size={16} className="mr-2" />
                New Session
              </Button>
            </div>
          </div>

          {/* Session Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-blue-500" />
                    <span className="font-medium text-sm">Total Sessions</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{trackingSessions.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-green-500" />
                    <span className="font-medium text-sm">Active Now</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {trackingSessions.filter(s => s.isActive).length}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-500" />
                    <span className="font-medium text-sm">Total Time</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {formatDuration(trackingSessions.reduce((total, session) => total + session.duration, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-orange-500" />
                    <span className="font-medium text-sm">Billable Value</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(trackingSessions.filter(s => s.billable).reduce((total, session) => 
                      total + ((session.duration / 3600) * session.rate), 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              {getFilteredTrackingSessions().length === 0 ? (
                <div className="p-8 text-center">
                  <Timer size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No tracking sessions found</p>
                  <Button onClick={handleCreateNewTrackingSession} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Create your first session
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredTrackingSessions().map((session) => (
                      <TableRow key={session.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{session.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {session.description}
                            </div>
                            {session.tags && session.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {session.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {session.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{session.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSessionCategoryColor(session.category)}>
                            {session.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {session.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  Active
                                </div>
                              </Badge>
                            ) : session.endTime ? (
                              <Badge variant="secondary">Completed</Badge>
                            ) : (
                              <Badge variant="outline">Stopped</Badge>
                            )}
                            {session.billable && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Billable
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDuration(session.duration)}
                        </TableCell>
                        <TableCell>{formatCurrency(session.rate)}/hr</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency((session.duration / 3600) * session.rate)}
                        </TableCell>
                        <TableCell>{session.employee}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleStartTrackingSession(session.id)}
                              title={session.isActive ? "Stop session" : "Start session"}
                            >
                              {session.isActive ? <Pause size={14} /> : <Play size={14} />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTrackingSession(session)}
                              title="Edit session"
                            >
                              <Edit size={14} />
                            </Button>
                            {!session.isActive && session.endTime && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleConvertToTimeEntry(session.id)}
                                title="Convert to time entry"
                              >
                                <ArrowRight size={14} />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTrackingSession(session.id)}
                              title="Delete session"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timesheet Tab */}
        <TabsContent value="timesheet" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Time Sheet</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{timeEntries.length} entries</span>
                <span>•</span>
                <span className="font-medium">
                  {timeEntries.reduce((total, entry) => total + entry.hours, 0)}h total
                </span>
              </div>
            </div>
            <Button onClick={handleCreateNewTimeEntry}>
              <Plus size={16} className="mr-2" />
              Add Time Entry
            </Button>
          </div>

          {/* Time Entry Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="font-medium text-sm">Total Hours</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {timeEntries.reduce((total, entry) => total + entry.hours, 0)}h
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="font-medium text-sm">Total Value</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(timeEntries.reduce((total, entry) => total + (entry.hours * entry.rate), 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-purple-500" />
                    <span className="font-medium text-sm">Billable</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + (entry.hours * entry.rate), 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-orange-500" />
                    <span className="font-medium text-sm">Avg Rate</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(timeEntries.length > 0 ? timeEntries.reduce((total, entry) => total + entry.rate, 0) / timeEntries.length : 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {timeEntries.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No time entries found</p>
                  <Button onClick={handleCreateNewTimeEntry} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Add your first time entry
                  </Button>
                </div>
              ) : (
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
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{formatDate(entry.date)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={entry.description}>
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell>{entry.employee}</TableCell>
                        <TableCell className="font-medium">{entry.hours}h</TableCell>
                        <TableCell>{formatCurrency(entry.rate)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(entry.hours * entry.rate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.billable ? "default" : "secondary"}>
                            {entry.billable ? "Billable" : "Non-billable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingTimeEntry(entry);
                                setShowTimeEntryDialog(true);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTimeEntryEnhanced(entry.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

        <TabsContent value="invoices" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Invoices</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Receipt size={16} />
                <span>{getFilteredInvoices().length} invoices</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewInvoice}>
                <Plus size={16} className="mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Invoice Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="font-medium text-sm">Total Amount</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-500" />
                    <span className="font-medium text-sm">Paid</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" />
                    <span className="font-medium text-sm">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="font-medium text-sm">Draft</span>
                  </div>
                  <span className="text-xl font-bold text-gray-600">
                    {formatCurrency(invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.amount, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {getFilteredInvoices().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No invoices found</p>
                  <Button onClick={handleCreateNewInvoice} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Create your first invoice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              getFilteredInvoices().map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={getInvoiceStatusColor(invoice.status)}
                            onClick={() => handleToggleInvoiceStatus(invoice.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {invoice.status}
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditInvoiceDetails(invoice)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Amount</span>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(invoice.amount)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Due Date</span>
                          <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Created</span>
                          <p className="text-sm font-medium">{formatDate(invoice.createdDate)}</p>
                        </div>
                      </div>
                      
                      {invoice.lineItems && invoice.lineItems.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <span className="text-xs font-medium text-gray-500 mb-2 block">Line Items</span>
                          <div className="space-y-1">
                            {invoice.lineItems.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.description} ({item.hours}h)</span>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                            {invoice.lineItems.length > 3 && (
                              <p className="text-xs text-gray-500">+{invoice.lineItems.length - 3} more items</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="clocks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Time Clocks</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{getFilteredClocks().length} clocks</span>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  {getFilteredClocks().filter(c => c.isRunning).length} running
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={clockFilter} onValueChange={setClockFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clocks</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNewClock}>
                <Plus size={16} className="mr-2" />
                New Clock
              </Button>
            </div>
          </div>

          {/* Clock Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-green-500" />
                    <span className="font-medium text-sm">Active Clocks</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {clocks.filter(c => c.isRunning).length}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="font-medium text-sm">Total Time</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatDuration(clocks.reduce((total, clock) => total + clock.duration, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-purple-500" />
                    <span className="font-medium text-sm">Average Session</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {clocks.length > 0 ? formatDuration(Math.floor(clocks.reduce((total, clock) => total + clock.duration, 0) / clocks.length)) : '00:00:00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Clocks Grid */}
          <div className="grid gap-4">
            {getFilteredClocks().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">
                    {clockFilter === 'running' ? 'No running clocks' : 
                     clockFilter === 'stopped' ? 'No stopped clocks' : 'No clocks found'}
                  </p>
                  <Button onClick={handleCreateNewClock} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Create your first clock
                  </Button>
                </CardContent>
              </Card>
            ) : (
              getFilteredClocks().map((clock) => (
                <Card key={clock.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Clock 
                            size={20} 
                            className={clock.isRunning ? "text-green-500 animate-pulse" : "text-gray-500"} 
                          />
                          <h4 className="font-semibold text-lg">{clock.name}</h4>
                          {clock.isRunning && (
                            <Badge className="bg-green-100 text-green-800 animate-pulse">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping"></div>
                              Running
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 ml-8">
                          {clock.description || 'No description provided'}
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500 ml-8">
                          <span>Started: {formatDate(clock.startTime)}</span>
                          <span className={clock.isRunning ? "font-medium text-green-600" : ""}>
                            Duration: {formatDuration(clock.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={clock.isRunning ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleClockStatus(clock.id)}
                        >
                          {clock.isRunning ? (
                            <>
                              <Pause size={14} className="mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play size={14} className="mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClockDetails(clock)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClock(clock.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

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
      </Tabs>

      {/* Dialog Components */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onSave={handleSaveTaskDetails}
        task={editingTask}
        caseId={caseData.id}
      />

      <MilestoneDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
        onSave={handleSaveMilestoneDetails}
        milestone={editingMilestone}
        caseId={caseData.id}
        availableTasks={tasks}
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

      {/* Edit Case Dialog */}
      <EditCaseDialog
        open={showEditCaseDialog}
        onOpenChange={setShowEditCaseDialog}
        case={caseData}
        onCaseUpdated={(updatedCase) => {
          setLocalCaseData(updatedCase);
          onUpdate(updatedCase);
        }}
      />

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        task={editingTask}
        onSave={handleSaveTaskDetails}
      />

      {/* Milestone Dialog */}
      <MilestoneDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
        milestone={editingMilestone}
        onSave={handleSaveMilestoneDetails}
      />

      {/* Enhanced Dialog Components */}
      
      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  defaultValue={editingNote?.title || ''}
                  placeholder="Enter note title..."
                />
              </div>
              <div>
                <Label htmlFor="note-type">Type</Label>
                <Select defaultValue={editingNote?.type || 'general'}>
                  <SelectTrigger id="note-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                defaultValue={editingNote?.content || ''}
                placeholder="Enter note content..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const title = (document.getElementById('note-title') as HTMLInputElement)?.value;
                const type = (document.querySelector('[id="note-type"] [data-state="checked"]') as HTMLElement)?.textContent?.toLowerCase() || 'general';
                const content = (document.getElementById('note-content') as HTMLTextAreaElement)?.value;
                handleSaveNoteDetails({ title, type, content });
              }}>
                <StickyNote size={16} className="mr-2" />
                {editingNote ? 'Update Note' : 'Create Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingComment ? 'Edit Comment' : 'Add New Comment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="comment-content">Comment</Label>
              <Textarea
                id="comment-content"
                defaultValue={editingComment?.content || ''}
                placeholder="Write your comment..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const content = (document.getElementById('comment-content') as HTMLTextAreaElement)?.value;
                handleSaveCommentDetails({ content });
              }}>
                <MessageCircle size={16} className="mr-2" />
                {editingComment ? 'Update Comment' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clock Dialog */}
      <Dialog open={showClockDialog} onOpenChange={setShowClockDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClock ? 'Edit Clock' : 'Create New Clock'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="clock-name">Clock Name</Label>
              <Input
                id="clock-name"
                defaultValue={editingClock?.name || ''}
                placeholder="e.g., Research, Document Review, Meeting..."
              />
            </div>
            <div>
              <Label htmlFor="clock-description">Description</Label>
              <Textarea
                id="clock-description"
                defaultValue={editingClock?.description || ''}
                placeholder="Describe what this clock tracks..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClockDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const name = (document.getElementById('clock-name') as HTMLInputElement)?.value;
                const description = (document.getElementById('clock-description') as HTMLTextAreaElement)?.value;
                handleSaveClockDetails({ name, description });
              }}>
                <Clock size={16} className="mr-2" />
                {editingClock ? 'Update Clock' : 'Create Clock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDetailDialog} onOpenChange={setShowInvoiceDetailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-description">Description</Label>
                <Input
                  id="invoice-description"
                  defaultValue={editingInvoice?.description || ''}
                  placeholder="Invoice description..."
                />
              </div>
              <div>
                <Label htmlFor="invoice-amount">Amount</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  defaultValue={editingInvoice?.amount || ''}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-due-date">Due Date</Label>
                <Input
                  id="invoice-due-date"
                  type="date"
                  defaultValue={editingInvoice?.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : ''}
                />
              </div>
              <div>
                <Label htmlFor="invoice-status">Status</Label>
                <Select defaultValue={editingInvoice?.status || 'draft'}>
                  <SelectTrigger id="invoice-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDetailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const description = (document.getElementById('invoice-description') as HTMLInputElement)?.value;
                const amount = parseFloat((document.getElementById('invoice-amount') as HTMLInputElement)?.value || '0');
                const dueDate = (document.getElementById('invoice-due-date') as HTMLInputElement)?.value;
                const status = (document.querySelector('[id="invoice-status"] [data-state="checked"]') as HTMLElement)?.textContent?.toLowerCase() || 'draft';
                handleSaveInvoiceDetails({ description, amount, dueDate, status, lineItems: editingInvoice?.lineItems || [] });
              }}>
                <Receipt size={16} className="mr-2" />
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Time Entry Dialog */}
      <Dialog open={showTimeEntryDialog} onOpenChange={setShowTimeEntryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTimeEntry ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="timeentry-description">Description</Label>
              <Input
                id="timeentry-description"
                defaultValue={editingTimeEntry?.description || ''}
                placeholder="What work was performed..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeentry-hours">Hours</Label>
                <Input
                  id="timeentry-hours"
                  type="number"
                  defaultValue={editingTimeEntry?.hours || ''}
                  placeholder="0.0"
                  step="0.25"
                />
              </div>
              <div>
                <Label htmlFor="timeentry-rate">Rate ($)</Label>
                <Input
                  id="timeentry-rate"
                  type="number"
                  defaultValue={editingTimeEntry?.rate || '250'}
                  placeholder="250"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeentry-date">Date</Label>
                <Input
                  id="timeentry-date"
                  type="date"
                  defaultValue={editingTimeEntry?.date ? new Date(editingTimeEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="timeentry-billable"
                  defaultChecked={editingTimeEntry?.billable !== false}
                  className="rounded"
                />
                <Label htmlFor="timeentry-billable">Billable</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTimeEntryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const description = (document.getElementById('timeentry-description') as HTMLInputElement)?.value;
                const hours = parseFloat((document.getElementById('timeentry-hours') as HTMLInputElement)?.value || '0');
                const rate = parseFloat((document.getElementById('timeentry-rate') as HTMLInputElement)?.value || '250');
                const date = (document.getElementById('timeentry-date') as HTMLInputElement)?.value;
                const billable = (document.getElementById('timeentry-billable') as HTMLInputElement)?.checked;
                handleSaveTimeEntryDetails({ description, hours, rate, date, billable });
              }}>
                <Clock size={16} className="mr-2" />
                {editingTimeEntry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Time Tracking Session Dialog */}
      <Dialog open={showTrackingSessionDialog} onOpenChange={setShowTrackingSessionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTrackingSession ? 'Edit Session' : 'Create New Session'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="session-title">Title</Label>
              <Input
                id="session-title"
                defaultValue={editingTrackingSession?.title || ''}
                placeholder="Enter session title..."
              />
            </div>
            <div>
              <Label htmlFor="session-description">Description</Label>
              <Textarea
                id="session-description"
                defaultValue={editingTrackingSession?.description || ''}
                placeholder="Enter session description..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="session-category">Category</Label>
              <Select defaultValue={editingTrackingSession?.category || 'Research'}>
                <SelectTrigger id="session-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Court">Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="session-billable">Billable</Label>
              <Select defaultValue={editingTrackingSession?.billable ? 'yes' : 'no'}>
                <SelectTrigger id="session-billable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="session-rate">Rate ($/hr)</Label>
              <Input
                id="session-rate"
                type="number"
                defaultValue={editingTrackingSession?.rate || ''}
                placeholder="Enter rate..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrackingSessionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const title = (document.getElementById('session-title') as HTMLInputElement)?.value;
                const description = (document.getElementById('session-description') as HTMLTextAreaElement)?.value;
                const category = (document.querySelector('[id="session-category"] [data-state="checked"]') as HTMLElement)?.textContent?.toLowerCase() || 'Research';
                const billable = (document.getElementById('session-billable') as HTMLInputElement)?.checked;
                const rate = parseFloat((document.getElementById('session-rate') as HTMLInputElement)?.value || '0');
                handleSaveTrackingSession({ title, description, category, billable, rate });
              }}>
                <Clock size={16} className="mr-2" />
                {editingTrackingSession ? 'Update Session' : 'Create Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                defaultValue={editingExpense?.description || ''}
                placeholder="Enter expense description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-amount">Amount ($)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingExpense?.amount || ''}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="expense-category">Category</Label>
                <Select defaultValue={editingExpense?.category || 'Legal Fees'}>
                  <SelectTrigger id="expense-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Legal Fees">Legal Fees</SelectItem>
                    <SelectItem value="Court Costs">Court Costs</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Expert Fees">Expert Fees</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  defaultValue={editingExpense?.date ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="expense-receipt">Receipt</Label>
                <Input
                  id="expense-receipt"
                  defaultValue={editingExpense?.receipt || ''}
                  placeholder="Receipt file name..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expense-billable"
                defaultChecked={editingExpense?.billable !== false}
                className="rounded"
              />
              <Label htmlFor="expense-billable">Billable to Client</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const description = (document.getElementById('expense-description') as HTMLInputElement)?.value;
                const amount = parseFloat((document.getElementById('expense-amount') as HTMLInputElement)?.value || '0');
                const date = (document.getElementById('expense-date') as HTMLInputElement)?.value;
                const receipt = (document.getElementById('expense-receipt') as HTMLInputElement)?.value;
                const billable = (document.getElementById('expense-billable') as HTMLInputElement)?.checked;
                const category = editingExpense?.category || 'Legal Fees';
                handleSaveExpense({ description, amount, date, receipt, billable, category });
              }}>
                <DollarSign size={16} className="mr-2" />
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Client Dialog */}
      <Dialog open={showContactClientDialog} onOpenChange={setShowContactClientDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact Record' : 'Contact Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="contact-type">Communication Type</Label>
              <Select defaultValue={editingContact?.type || 'email'}>
                <SelectTrigger id="contact-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">In-Person Meeting</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contact-subject">Subject/Purpose</Label>
              <Input
                id="contact-subject"
                defaultValue={editingContact?.subject || ''}
                placeholder="Enter subject or purpose..."
              />
            </div>
            <div>
              <Label htmlFor="contact-recipient">Recipient</Label>
              <Input
                id="contact-recipient"
                defaultValue={editingContact?.recipient || caseData.client}
                placeholder="Enter recipient..."
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Message/Notes</Label>
              <Textarea
                id="contact-message"
                defaultValue={editingContact?.message || ''}
                placeholder="Enter message content or notes..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowContactClientDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const type = editingContact?.type || 'email';
                const subject = (document.getElementById('contact-subject') as HTMLInputElement)?.value;
                const recipient = (document.getElementById('contact-recipient') as HTMLInputElement)?.value;
                const message = (document.getElementById('contact-message') as HTMLTextAreaElement)?.value;
                handleSaveContact({ type, subject, recipient, message });
              }}>
                <MessageSquare size={16} className="mr-2" />
                {editingContact ? 'Update Contact' : 'Log Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleMeetingDialog} onOpenChange={setShowScheduleMeetingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                defaultValue={editingMeeting?.title || ''}
                placeholder="Enter meeting title..."
              />
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                defaultValue={editingMeeting?.description || ''}
                placeholder="Enter meeting description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  defaultValue={editingMeeting?.date ? new Date(editingMeeting.date).toISOString().split('T')[0] : ''}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  defaultValue={editingMeeting?.time || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-duration">Duration (minutes)</Label>
                <Input
                  id="meeting-duration"
                  type="number"
                  defaultValue={editingMeeting?.duration || '60'}
                  placeholder="60"
                />
              </div>
              <div>
                <Label htmlFor="meeting-type">Type</Label>
                <Select defaultValue={editingMeeting?.type || 'in-person'}>
                  <SelectTrigger id="meeting-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-location">Location/Link</Label>
              <Input
                id="meeting-location"
                defaultValue={editingMeeting?.location || ''}
                placeholder="Meeting location or video conference link..."
              />
            </div>
            <div>
              <Label htmlFor="meeting-attendees">Attendees</Label>
              <Input
                id="meeting-attendees"
                defaultValue={editingMeeting?.attendees?.join(', ') || caseData.client}
                placeholder="Enter attendees separated by commas..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleMeetingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const title = (document.getElementById('meeting-title') as HTMLInputElement)?.value;
                const description = (document.getElementById('meeting-description') as HTMLTextAreaElement)?.value;
                const date = (document.getElementById('meeting-date') as HTMLInputElement)?.value;
                const time = (document.getElementById('meeting-time') as HTMLInputElement)?.value;
                const duration = parseInt((document.getElementById('meeting-duration') as HTMLInputElement)?.value || '60');
                const location = (document.getElementById('meeting-location') as HTMLInputElement)?.value;
                const attendees = (document.getElementById('meeting-attendees') as HTMLInputElement)?.value.split(',').map(s => s.trim());
                const type = editingMeeting?.type || 'in-person';
                handleSaveMeeting({ title, description, date, time, duration, location, attendees, type, reminders: ['1 day'] });
              }}>
                <Calendar size={16} className="mr-2" />
                {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 