import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Calendar as CalendarIcon,
  Clock, 
  Receipt, 
  Edit,
  Trash2,
  Timer,
  MapPin,
  Route,
  DollarSign,
  FileText,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  hourlyRate: number;
  isRunning: boolean;
  date: Date;
  client?: string;
  project?: string;
  totalAmount: number;
  vatAmount: number;
  finalAmount: number;
}

interface TravelEntry {
  id: string;
  date: Date;
  clientName: string;
  from: string;
  to: string;
  pricePerKm: number;
  totalKm: number;
  totalAmountKm: number;
  hourlyRate: number;
  hoursSpent: number;
  totalAmountHours: number;
  overallTotal: number;
}

interface InvoiceFormData {
  number: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  caseName?: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: Array<{
    id?: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  selectedTimeEntries: string[];
  selectedTravelEntries: string[];
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
  terms?: string;
  template: string;
}

// Mock data for invoice creation
const mockClients = [
  { id: 'client_1', name: 'Clinsmen' },
  { id: 'client_2', name: 'ABC Corp' },
  { id: 'client_3', name: 'XYZ Ltd' },
  { id: 'client_4', name: 'Legal Partners' }
];

const mockCases = [
  { id: 'case_1', name: 'Contract Review', clientId: 'client_1' },
  { id: 'case_2', name: 'Litigation Support', clientId: 'client_1' },
  { id: 'case_3', name: 'Business Acquisition', clientId: 'client_2' },
  { id: 'case_4', name: 'Due Diligence', clientId: 'client_3' },
  { id: 'case_5', name: 'Compliance Review', clientId: 'client_4' }
];

const TimeTracking = () => {
  const { toast } = useToast();
  
  // Time Tracking State
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimers, setActiveTimers] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Manual Entry State
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    description: '',
    duration: '',
    hourlyRate: 12,
    date: new Date(),
    client: '',
    project: ''
  });

  // Edit Time Entry State
  const [showEditTimeEntry, setShowEditTimeEntry] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [editTimeForm, setEditTimeForm] = useState({
    description: '',
    duration: '',
    hourlyRate: 12,
    date: new Date(),
    client: '',
    project: ''
  });

  // Travel Sheet State
  const [travelEntries, setTravelEntries] = useState<TravelEntry[]>([]);
  const [showTravelEntry, setShowTravelEntry] = useState(false);
  const [travelEntry, setTravelEntry] = useState({
    date: new Date(),
    clientName: '',
    from: '',
    to: '',
    pricePerKm: 10,
    totalKm: 0,
    hourlyRate: 100,
    hoursSpent: 0
  });

  // Edit Travel Entry State
  const [showEditTravelEntry, setShowEditTravelEntry] = useState(false);
  const [editingTravelEntry, setEditingTravelEntry] = useState<TravelEntry | null>(null);
  const [editTravelForm, setEditTravelForm] = useState({
    date: new Date(),
    clientName: '',
    from: '',
    to: '',
    pricePerKm: 10,
    totalKm: 0,
    hourlyRate: 100,
    hoursSpent: 0
  });

  // Create Invoice State
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
    number: '',
    clientId: '',
    clientName: '',
    caseId: '',
    caseName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [],
    selectedTimeEntries: [],
    selectedTravelEntries: [],
    taxRate: 15,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    notes: '',
    terms: 'Payment due within 30 days of invoice date.',
    template: 'professional'
  });

  // Travel Invoice State
  const [showCreateTravelInvoice, setShowCreateTravelInvoice] = useState(false);
  const [selectedTravelEntries, setSelectedTravelEntries] = useState<string[]>([]);
  const [travelInvoiceForm, setTravelInvoiceForm] = useState<InvoiceFormData>({
    number: '',
    clientId: '',
    clientName: '',
    caseId: '',
    caseName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [],
    selectedTimeEntries: [],
    selectedTravelEntries: [],
    taxRate: 15,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    notes: '',
    terms: 'Payment due within 30 days of invoice date.',
    template: 'professional'
  });

  // Mock client names for dropdown
  const mockClientNames = ['Clinsmen', 'ABC Corp', 'XYZ Ltd', 'Legal Partners'];
  const mockProjects = ['Contract Review', 'Litigation', 'Due Diligence', 'Compliance'];

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeEntries(prev => prev.map(entry => {
        if (entry.isRunning) {
          const newDuration = Math.floor((new Date().getTime() - entry.startTime.getTime()) / 1000);
          const totalAmount = (newDuration / 3600) * entry.hourlyRate;
          const vatAmount = totalAmount * 0.1;
          return {
            ...entry,
            duration: newDuration,
            totalAmount,
            vatAmount,
            finalAmount: totalAmount + vatAmount
          };
        }
        return entry;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Timer controls
  const startTimer = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      description: '',
      startTime: new Date(),
      duration: 0,
      hourlyRate: 12,
      isRunning: true,
      date: new Date(),
      totalAmount: 0,
      vatAmount: 0,
      finalAmount: 0
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
    setActiveTimers(prev => [...prev, newEntry.id]);
    
    toast({
      title: "Timer Started",
      description: "New timer has been started."
    });
  };

  const pauseTimer = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, isRunning: false } : entry
    ));
    setActiveTimers(prev => prev.filter(id => id !== entryId));
    
    toast({
      title: "Timer Paused",
      description: "Timer has been paused."
    });
  };

  const resumeTimer = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { 
        ...entry, 
        isRunning: true,
        startTime: new Date(new Date().getTime() - entry.duration * 1000)
      } : entry
    ));
    setActiveTimers(prev => [...prev, entryId]);
    
    toast({
      title: "Timer Resumed",
      description: "Timer has been resumed."
    });
  };

  const stopTimer = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { 
        ...entry, 
        isRunning: false,
        endTime: new Date()
      } : entry
    ));
    setActiveTimers(prev => prev.filter(id => id !== entryId));
    
    toast({
      title: "Timer Stopped",
      description: "Timer has been stopped and saved."
    });
  };

  const updateTimeEntry = (entryId: string, field: string, value: string | number) => {
    setTimeEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updated = { ...entry, [field]: value };
        if (field === 'hourlyRate') {
          const totalAmount = (updated.duration / 3600) * updated.hourlyRate;
          const vatAmount = totalAmount * 0.1;
          updated.totalAmount = totalAmount;
          updated.vatAmount = vatAmount;
          updated.finalAmount = totalAmount + vatAmount;
        }
        return updated;
      }
      return entry;
    }));
  };

  // Manual entry
  const saveManualEntry = () => {
    if (!manualEntry.description || !manualEntry.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in description and duration.",
        variant: "destructive"
      });
      return;
    }

    const durationInSeconds = parseFloat(manualEntry.duration) * 3600;
    const totalAmount = parseFloat(manualEntry.duration) * manualEntry.hourlyRate;
    const vatAmount = totalAmount * 0.1;

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      description: manualEntry.description,
      startTime: manualEntry.date,
      endTime: new Date(manualEntry.date.getTime() + durationInSeconds * 1000),
      duration: durationInSeconds,
      hourlyRate: manualEntry.hourlyRate,
      isRunning: false,
      date: manualEntry.date,
      client: manualEntry.client,
      project: manualEntry.project,
      totalAmount,
      vatAmount,
      finalAmount: totalAmount + vatAmount
    };

    setTimeEntries(prev => [...prev, newEntry]);
    setShowManualEntry(false);
    setManualEntry({
      description: '',
      duration: '',
      hourlyRate: 12,
      date: new Date(),
      client: '',
      project: ''
    });

    toast({
      title: "Time Entry Added",
      description: "Manual time entry has been saved."
    });
  };

  // Travel sheet
  const saveTravelEntry = () => {
    if (!travelEntry.clientName || !travelEntry.from || !travelEntry.to) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const totalAmountKm = travelEntry.totalKm * travelEntry.pricePerKm;
    const totalAmountHours = travelEntry.hoursSpent * travelEntry.hourlyRate;
    const overallTotal = totalAmountKm + totalAmountHours;

    const newTravelEntry: TravelEntry = {
      id: Date.now().toString(),
      date: travelEntry.date,
      clientName: travelEntry.clientName,
      from: travelEntry.from,
      to: travelEntry.to,
      pricePerKm: travelEntry.pricePerKm,
      totalKm: travelEntry.totalKm,
      totalAmountKm,
      hourlyRate: travelEntry.hourlyRate,
      hoursSpent: travelEntry.hoursSpent,
      totalAmountHours,
      overallTotal
    };

    setTravelEntries(prev => [...prev, newTravelEntry]);
    setShowTravelEntry(false);
    setTravelEntry({
      date: new Date(),
      clientName: '',
      from: '',
      to: '',
      pricePerKm: 10,
      totalKm: 0,
      hourlyRate: 100,
      hoursSpent: 0
    });

    toast({
      title: "Travel Entry Added",
      description: "Travel time sheet entry has been saved."
    });
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = (entries: TimeEntry[]) => {
    const subtotal = entries.reduce((sum, entry) => sum + entry.totalAmount, 0);
    const discountAmount = (subtotal * invoiceForm.discountRate) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * invoiceForm.taxRate) / 100;
    const total = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  };

  // Create invoice from selected time entries
  const createInvoiceFromTime = () => {
    const completedEntries = timeEntries.filter(entry => !entry.isRunning);
    if (completedEntries.length === 0) {
      toast({
        title: "No Entries",
        description: "No completed time entries to create invoice from.",
        variant: "destructive"
      });
      return;
    }

    // Reset form and pre-select all completed entries
    setSelectedTimeEntries(completedEntries.map(entry => entry.id));
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    setInvoiceForm(prev => ({
      ...prev,
      number: invoiceNumber,
      selectedTimeEntries: completedEntries.map(entry => entry.id)
    }));
    
    setShowCreateInvoice(true);
  };

  // Handle time entry selection for invoice
  const handleTimeEntrySelection = (entryId: string, checked: boolean) => {
    setSelectedTimeEntries(prev => {
      const newSelection = checked 
        ? [...prev, entryId]
        : prev.filter(id => id !== entryId);
      
      // Update invoice form
      const selectedEntries = timeEntries.filter(entry => newSelection.includes(entry.id));
      const items = selectedEntries.map(entry => ({
        description: entry.description || `Time Entry - ${entry.client || 'No Client'}`,
        quantity: Number((entry.duration / 3600).toFixed(2)),
        rate: entry.hourlyRate,
        amount: entry.totalAmount
      }));

      const totals = calculateInvoiceTotals(selectedEntries);
      
      setInvoiceForm(prev => ({
        ...prev,
        items,
        selectedTimeEntries: newSelection,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total
      }));

      return newSelection;
    });
  };

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    const clientCases = mockCases.filter(c => c.clientId === clientId);
    
    setInvoiceForm(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
      caseId: clientCases.length > 0 ? clientCases[0].id : '',
      caseName: clientCases.length > 0 ? clientCases[0].name : ''
    }));
  };

  // Handle case selection change
  const handleCaseChange = (caseId: string) => {
    const case_ = mockCases.find(c => c.id === caseId);
    
    setInvoiceForm(prev => ({
      ...prev,
      caseId,
      caseName: case_?.name || ''
    }));
  };

  // Save invoice
  const saveInvoice = () => {
    if (!invoiceForm.clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client.",
        variant: "destructive"
      });
      return;
    }

    if (selectedTimeEntries.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one time entry.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to your backend
    console.log('Saving invoice:', invoiceForm);

    toast({
      title: "Invoice Created",
      description: `Invoice ${invoiceForm.number} created successfully with ${selectedTimeEntries.length} time entries.`
    });

    // Reset and close
    setShowCreateInvoice(false);
    setSelectedTimeEntries([]);
    setInvoiceForm(prev => ({
      ...prev,
      number: '',
      clientId: '',
      clientName: '',
      caseId: '',
      caseName: '',
      items: [],
      selectedTimeEntries: [],
      selectedTravelEntries: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0
    }));
  };

  // Calculate travel invoice totals
  const calculateTravelInvoiceTotals = (entries: TravelEntry[]) => {
    const subtotal = entries.reduce((sum, entry) => sum + entry.overallTotal, 0);
    const discountAmount = (subtotal * travelInvoiceForm.discountRate) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * travelInvoiceForm.taxRate) / 100;
    const total = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  };

  // Create invoice from travel entries
  const createInvoiceFromTravel = () => {
    if (travelEntries.length === 0) {
      toast({
        title: "No Travel Entries",
        description: "No travel entries to create invoice from.",
        variant: "destructive"
      });
      return;
    }

    // Reset form and pre-select all travel entries
    setSelectedTravelEntries(travelEntries.map(entry => entry.id));
    
    // Generate invoice number
    const invoiceNumber = `TRV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    setTravelInvoiceForm(prev => ({
      ...prev,
      number: invoiceNumber,
      selectedTravelEntries: travelEntries.map(entry => entry.id)
    }));
    
    setShowCreateTravelInvoice(true);
  };

  // Handle travel entry selection for invoice
  const handleTravelEntrySelection = (entryId: string, checked: boolean) => {
    setSelectedTravelEntries(prev => {
      const newSelection = checked 
        ? [...prev, entryId]
        : prev.filter(id => id !== entryId);
      
      // Update invoice form
      const selectedEntries = travelEntries.filter(entry => newSelection.includes(entry.id));
      const items = selectedEntries.map(entry => ({
        description: `Travel: ${entry.from} to ${entry.to} - ${entry.clientName}`,
        quantity: 1,
        rate: entry.overallTotal,
        amount: entry.overallTotal
      }));

      const totals = calculateTravelInvoiceTotals(selectedEntries);
      
      setTravelInvoiceForm(prev => ({
        ...prev,
        items,
        selectedTravelEntries: newSelection,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total
      }));

      return newSelection;
    });
  };

  // Handle travel client selection change
  const handleTravelClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    const clientCases = mockCases.filter(c => c.clientId === clientId);
    
    setTravelInvoiceForm(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
      caseId: clientCases.length > 0 ? clientCases[0].id : '',
      caseName: clientCases.length > 0 ? clientCases[0].name : ''
    }));
  };

  // Handle travel case selection change
  const handleTravelCaseChange = (caseId: string) => {
    const case_ = mockCases.find(c => c.id === caseId);
    
    setTravelInvoiceForm(prev => ({
      ...prev,
      caseId,
      caseName: case_?.name || ''
    }));
  };

  // Save travel invoice
  const saveTravelInvoice = () => {
    if (!travelInvoiceForm.clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client.",
        variant: "destructive"
      });
      return;
    }

    if (selectedTravelEntries.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one travel entry.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to your backend
    console.log('Saving travel invoice:', travelInvoiceForm);

    toast({
      title: "Travel Invoice Created",
      description: `Invoice ${travelInvoiceForm.number} created successfully with ${selectedTravelEntries.length} travel entries.`
    });

    // Reset and close
    setShowCreateTravelInvoice(false);
    setSelectedTravelEntries([]);
    setTravelInvoiceForm(prev => ({
      ...prev,
      number: '',
      clientId: '',
      clientName: '',
      caseId: '',
      caseName: '',
      items: [],
      selectedTravelEntries: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0
    }));
  };

  // Edit Time Entry Functions
  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingTimeEntry(entry);
    setEditTimeForm({
      description: entry.description,
      duration: (entry.duration / 3600).toString(),
      hourlyRate: entry.hourlyRate,
      date: entry.date,
      client: entry.client || '',
      project: entry.project || ''
    });
    setShowEditTimeEntry(true);
  };

  const saveEditedTimeEntry = () => {
    if (!editingTimeEntry) return;

    if (!editTimeForm.description || !editTimeForm.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in description and duration.",
        variant: "destructive"
      });
      return;
    }

    const durationInSeconds = parseFloat(editTimeForm.duration) * 3600;
    const totalAmount = parseFloat(editTimeForm.duration) * editTimeForm.hourlyRate;
    const vatAmount = totalAmount * 0.1;

    setTimeEntries(prev => prev.map(entry => 
      entry.id === editingTimeEntry.id ? {
        ...entry,
        description: editTimeForm.description,
        duration: durationInSeconds,
        hourlyRate: editTimeForm.hourlyRate,
        date: editTimeForm.date,
        client: editTimeForm.client,
        project: editTimeForm.project,
        totalAmount,
        vatAmount,
        finalAmount: totalAmount + vatAmount,
        endTime: new Date(editTimeForm.date.getTime() + durationInSeconds * 1000)
      } : entry
    ));

    setShowEditTimeEntry(false);
    setEditingTimeEntry(null);

    toast({
      title: "Time Entry Updated",
      description: "Time entry has been successfully updated."
    });
  };

  const handleDeleteTimeEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      setActiveTimers(prev => prev.filter(id => id !== entryId));
      
      toast({
        title: "Time Entry Deleted",
        description: "Time entry has been deleted successfully."
      });
    }
  };

  // Edit Travel Entry Functions
  const handleEditTravelEntry = (entry: TravelEntry) => {
    setEditingTravelEntry(entry);
    setEditTravelForm({
      date: entry.date,
      clientName: entry.clientName,
      from: entry.from,
      to: entry.to,
      pricePerKm: entry.pricePerKm,
      totalKm: entry.totalKm,
      hourlyRate: entry.hourlyRate,
      hoursSpent: entry.hoursSpent
    });
    setShowEditTravelEntry(true);
  };

  const saveEditedTravelEntry = () => {
    if (!editingTravelEntry) return;

    if (!editTravelForm.clientName || !editTravelForm.from || !editTravelForm.to) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const totalAmountKm = editTravelForm.totalKm * editTravelForm.pricePerKm;
    const totalAmountHours = editTravelForm.hoursSpent * editTravelForm.hourlyRate;
    const overallTotal = totalAmountKm + totalAmountHours;

    setTravelEntries(prev => prev.map(entry => 
      entry.id === editingTravelEntry.id ? {
        ...entry,
        date: editTravelForm.date,
        clientName: editTravelForm.clientName,
        from: editTravelForm.from,
        to: editTravelForm.to,
        pricePerKm: editTravelForm.pricePerKm,
        totalKm: editTravelForm.totalKm,
        totalAmountKm,
        hourlyRate: editTravelForm.hourlyRate,
        hoursSpent: editTravelForm.hoursSpent,
        totalAmountHours,
        overallTotal
      } : entry
    ));

    setShowEditTravelEntry(false);
    setEditingTravelEntry(null);

    toast({
      title: "Travel Entry Updated",
      description: "Travel entry has been successfully updated."
    });
  };

  const handleDeleteTravelEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this travel entry?')) {
      setTravelEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      toast({
        title: "Travel Entry Deleted",
        description: "Travel entry has been deleted successfully."
      });
    }
  };

  return (
    <DashboardLayout title="Time Tracking">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Time Tracking</h1>
            <p className="text-gray-600">Track billable hours and travelling expenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
              <Play size={16} className="mr-2" />
              Start New Timer
            </Button>
            <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus size={16} className="mr-2" />
                  Add Manual Entry
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timers">Time Tracking</TabsTrigger>
            <TabsTrigger value="travel">Travel Time Sheets</TabsTrigger>
          </TabsList>

          {/* Time Tracking Tab */}
          <TabsContent value="timers" className="space-y-6">
            {/* Active Timers */}
            {timeEntries.filter(entry => entry.isRunning).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer size={18} className="text-green-600" />
                    Active Timers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {timeEntries.filter(entry => entry.isRunning).map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg bg-green-50">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <Input
                              placeholder="Enter description..."
                              value={entry.description}
                              onChange={(e) => updateTimeEntry(entry.id, 'description', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Timer</div>
                              <div className="text-lg font-mono font-bold text-green-600">
                                {formatTime(entry.duration)}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Rate per hour</Label>
                            <div className="flex items-center">
                              <span className="text-sm mr-1">R</span>
                              <Input
                                type="number"
                                value={entry.hourlyRate}
                                onChange={(e) => updateTimeEntry(entry.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Total Amount</div>
                              <div className="font-bold">{formatCurrency(entry.totalAmount)}</div>
                              <div className="text-xs text-gray-500">VAT: {formatCurrency(entry.vatAmount)}</div>
                              <div className="text-sm font-bold text-green-600">{formatCurrency(entry.finalAmount)}</div>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => pauseTimer(entry.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Pause size={14} />
                              </Button>
                              <Button
                                onClick={() => stopTimer(entry.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Square size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Entries Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Time Entries</CardTitle>
                  <Button onClick={createInvoiceFromTime} variant="outline">
                    <Receipt size={16} className="mr-2" />
                    Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Client/Project</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>VAT (10%)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {entry.isRunning ? (
                            <Badge variant="secondary">Running...</Badge>
                          ) : (
                            entry.description || 'No description'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{entry.client || 'No client'}</div>
                            <div className="text-gray-500">{entry.project || 'No project'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatTime(entry.duration)}
                        </TableCell>
                        <TableCell>{formatCurrency(entry.hourlyRate)}</TableCell>
                        <TableCell>{formatCurrency(entry.totalAmount)}</TableCell>
                        <TableCell>{formatCurrency(entry.vatAmount)}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(entry.finalAmount)}
                        </TableCell>
                        <TableCell>
                          {entry.isRunning ? (
                            <Badge className="bg-green-100 text-green-800">Running</Badge>
                          ) : (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!entry.isRunning && (
                              <Button
                                onClick={() => resumeTimer(entry.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Play size={14} />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEditTimeEntry(entry)}>
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeEntry(entry.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {timeEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No time entries yet. Start a timer or add a manual entry.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Travel Time Sheets Tab */}
          <TabsContent value="travel" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Route size={18} />
                    Travel Time Sheets
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={showTravelEntry} onOpenChange={setShowTravelEntry}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus size={16} className="mr-2" />
                          Add Travel Entry
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button onClick={createInvoiceFromTravel} variant="outline">
                      <Receipt size={16} className="mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Price/Km</TableHead>
                      <TableHead>Total Km</TableHead>
                      <TableHead>Amount (Km)</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount (Hours)</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.clientName}</TableCell>
                        <TableCell>{entry.from}</TableCell>
                        <TableCell>{entry.to}</TableCell>
                        <TableCell>{formatCurrency(entry.pricePerKm)}</TableCell>
                        <TableCell>{entry.totalKm}km</TableCell>
                        <TableCell>{formatCurrency(entry.totalAmountKm)}</TableCell>
                        <TableCell>{formatCurrency(entry.hourlyRate)}</TableCell>
                        <TableCell>{entry.hoursSpent}h</TableCell>
                        <TableCell>{formatCurrency(entry.totalAmountHours)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(entry.overallTotal)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTravelEntry(entry)}>
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTravelEntry(entry.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {travelEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No travel entries yet. Click "Add Travel Entry" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Manual Entry Dialog */}
        <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Manual Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (hours) *</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={manualEntry.duration}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={manualEntry.hourlyRate}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select 
                    value={manualEntry.client} 
                    onValueChange={(value) => setManualEntry(prev => ({ ...prev, client: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Project</Label>
                  <Select 
                    value={manualEntry.project} 
                    onValueChange={(value) => setManualEntry(prev => ({ ...prev, project: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {manualEntry.date.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={manualEntry.date}
                      onSelect={(date) => date && setManualEntry(prev => ({ ...prev, date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={saveManualEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Travel Entry Dialog */}
        <Dialog open={showTravelEntry} onOpenChange={setShowTravelEntry}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin size={18} />
                Add Travel Time Sheet Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {travelEntry.date.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={travelEntry.date}
                        onSelect={(date) => date && setTravelEntry(prev => ({ ...prev, date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Client Name *</Label>
                  <Select 
                    value={travelEntry.clientName} 
                    onValueChange={(value) => setTravelEntry(prev => ({ ...prev, clientName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From *</Label>
                  <Input
                    value={travelEntry.from}
                    onChange={(e) => setTravelEntry(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="e.g., JHB"
                  />
                </div>
                <div>
                  <Label>To *</Label>
                  <Input
                    value={travelEntry.to}
                    onChange={(e) => setTravelEntry(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="e.g., PTA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price per Km</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={travelEntry.pricePerKm}
                      onChange={(e) => setTravelEntry(prev => ({ ...prev, pricePerKm: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Total Km</Label>
                  <Input
                    type="number"
                    value={travelEntry.totalKm}
                    onChange={(e) => setTravelEntry(prev => ({ ...prev, totalKm: parseFloat(e.target.value) || 0 }))}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label>Total Amount (Km)</Label>
                  <div className="p-2 bg-gray-50 rounded font-medium">
                    {formatCurrency(travelEntry.totalKm * travelEntry.pricePerKm)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={travelEntry.hourlyRate}
                      onChange={(e) => setTravelEntry(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Hours Spent</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={travelEntry.hoursSpent}
                    onChange={(e) => setTravelEntry(prev => ({ ...prev, hoursSpent: parseFloat(e.target.value) || 0 }))}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label>Total Amount (Hours)</Label>
                  <div className="p-2 bg-gray-50 rounded font-medium">
                    {formatCurrency(travelEntry.hoursSpent * travelEntry.hourlyRate)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(
                      (travelEntry.totalKm * travelEntry.pricePerKm) + 
                      (travelEntry.hoursSpent * travelEntry.hourlyRate)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowTravelEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={saveTravelEntry}>
                  Save Travel Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Time Entry Dialog */}
        <Dialog open={showEditTimeEntry} onOpenChange={setShowEditTimeEntry}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={editTimeForm.description}
                  onChange={(e) => setEditTimeForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (hours) *</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={editTimeForm.duration}
                    onChange={(e) => setEditTimeForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={editTimeForm.hourlyRate}
                      onChange={(e) => setEditTimeForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select 
                    value={editTimeForm.client} 
                    onValueChange={(value) => setEditTimeForm(prev => ({ ...prev, client: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Project</Label>
                  <Select 
                    value={editTimeForm.project} 
                    onValueChange={(value) => setEditTimeForm(prev => ({ ...prev, project: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editTimeForm.date.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editTimeForm.date}
                      onSelect={(date) => date && setEditTimeForm(prev => ({ ...prev, date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowEditTimeEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedTimeEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Travel Entry Dialog */}
        <Dialog open={showEditTravelEntry} onOpenChange={setShowEditTravelEntry}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin size={18} />
                Edit Travel Time Sheet Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editTravelForm.date.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editTravelForm.date}
                        onSelect={(date) => date && setEditTravelForm(prev => ({ ...prev, date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Client Name *</Label>
                  <Select 
                    value={editTravelForm.clientName} 
                    onValueChange={(value) => setEditTravelForm(prev => ({ ...prev, clientName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From *</Label>
                  <Input
                    value={editTravelForm.from}
                    onChange={(e) => setEditTravelForm(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="e.g., JHB"
                  />
                </div>
                <div>
                  <Label>To *</Label>
                  <Input
                    value={editTravelForm.to}
                    onChange={(e) => setEditTravelForm(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="e.g., PTA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price per Km</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={editTravelForm.pricePerKm}
                      onChange={(e) => setEditTravelForm(prev => ({ ...prev, pricePerKm: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Total Km</Label>
                  <Input
                    type="number"
                    value={editTravelForm.totalKm}
                    onChange={(e) => setEditTravelForm(prev => ({ ...prev, totalKm: parseFloat(e.target.value) || 0 }))}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label>Total Amount (Km)</Label>
                  <div className="p-2 bg-gray-50 rounded font-medium">
                    {formatCurrency(editTravelForm.totalKm * editTravelForm.pricePerKm)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">R</span>
                    <Input
                      type="number"
                      value={editTravelForm.hourlyRate}
                      onChange={(e) => setEditTravelForm(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Hours Spent</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editTravelForm.hoursSpent}
                    onChange={(e) => setEditTravelForm(prev => ({ ...prev, hoursSpent: parseFloat(e.target.value) || 0 }))}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label>Total Amount (Hours)</Label>
                  <div className="p-2 bg-gray-50 rounded font-medium">
                    {formatCurrency(editTravelForm.hoursSpent * editTravelForm.hourlyRate)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(
                      (editTravelForm.totalKm * editTravelForm.pricePerKm) + 
                      (editTravelForm.hoursSpent * editTravelForm.hourlyRate)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowEditTravelEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedTravelEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Invoice Dialog */}
        <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Create Invoice from Time Entries
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number *</Label>
                  <Input
                    value={invoiceForm.number}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="INV-2024-001"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                                     <Select 
                     value={invoiceForm.status} 
                     onValueChange={(value: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled') => setInvoiceForm(prev => ({ ...prev, status: value }))}
                   >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client and Case Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client *</Label>
                  <Select 
                    value={invoiceForm.clientId} 
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Case (Optional)</Label>
                  <Select 
                    value={invoiceForm.caseId} 
                    onValueChange={handleCaseChange}
                    disabled={!invoiceForm.clientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCases
                        .filter(case_ => case_.clientId === invoiceForm.clientId)
                        .map(case_ => (
                          <SelectItem key={case_.id} value={case_.id}>{case_.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Time Entries Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Select Time Entries</Label>
                  <div className="flex gap-2">
                                         <Button
                       variant="outline"
                       size="sm"
                       onClick={() => {
                         const completedEntries = timeEntries.filter(entry => !entry.isRunning);
                         const allIds = completedEntries.map(entry => entry.id);
                         setSelectedTimeEntries(allIds);
                         
                         // Update invoice form with all entries
                         const items = completedEntries.map(entry => ({
                           description: entry.description || `Time Entry - ${entry.client || 'No Client'}`,
                           quantity: Number((entry.duration / 3600).toFixed(2)),
                           rate: entry.hourlyRate,
                           amount: entry.totalAmount
                         }));

                         const totals = calculateInvoiceTotals(completedEntries);
                         
                         setInvoiceForm(prev => ({
                           ...prev,
                           items,
                           selectedTimeEntries: allIds,
                           subtotal: totals.subtotal,
                           discountAmount: totals.discountAmount,
                           taxAmount: totals.taxAmount,
                           total: totals.total
                         }));
                       }}
                     >
                       Select All
                     </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTimeEntries([]);
                        setInvoiceForm(prev => ({ ...prev, items: [], subtotal: 0, taxAmount: 0, total: 0 }));
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries
                        .filter(entry => !entry.isRunning)
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedTimeEntries.includes(entry.id)}
                                onCheckedChange={(checked) => 
                                  handleTimeEntrySelection(entry.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>{entry.description || 'No description'}</TableCell>
                            <TableCell>{entry.client || 'No client'}</TableCell>
                            <TableCell className="font-mono">{formatTime(entry.duration)}</TableCell>
                            <TableCell>{formatCurrency(entry.hourlyRate)}</TableCell>
                            <TableCell>{formatCurrency(entry.totalAmount)}</TableCell>
                            <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  
                  {timeEntries.filter(entry => !entry.isRunning).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No completed time entries available.
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Invoice Calculations */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={invoiceForm.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value) || 0;
                        setInvoiceForm(prev => ({ ...prev, taxRate }));
                        
                        // Recalculate totals
                        const selectedEntries = timeEntries.filter(entry => 
                          selectedTimeEntries.includes(entry.id)
                        );
                        const totals = calculateInvoiceTotals(selectedEntries);
                        setInvoiceForm(prev => ({ 
                          ...prev, 
                          taxRate,
                          taxAmount: totals.taxAmount,
                          total: totals.total 
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Discount Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={invoiceForm.discountRate}
                      onChange={(e) => {
                        const discountRate = parseFloat(e.target.value) || 0;
                        setInvoiceForm(prev => ({ ...prev, discountRate }));
                        
                        // Recalculate totals
                        const selectedEntries = timeEntries.filter(entry => 
                          selectedTimeEntries.includes(entry.id)
                        );
                        const totals = calculateInvoiceTotals(selectedEntries);
                        setInvoiceForm(prev => ({ 
                          ...prev, 
                          discountRate,
                          discountAmount: totals.discountAmount,
                          taxAmount: totals.taxAmount,
                          total: totals.total 
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(invoiceForm.subtotal)}</span>
                  </div>
                  {invoiceForm.discountRate > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({invoiceForm.discountRate}%):</span>
                      <span className="font-mono">-{formatCurrency(invoiceForm.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({invoiceForm.taxRate}%):</span>
                    <span className="font-mono">{formatCurrency(invoiceForm.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(invoiceForm.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the client..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={invoiceForm.terms}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Payment terms and conditions..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateInvoice(false)}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setInvoiceForm(prev => ({ ...prev, status: 'draft' }));
                      saveInvoice();
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={() => {
                      setInvoiceForm(prev => ({ ...prev, status: 'sent' }));
                      saveInvoice();
                    }}
                  >
                    Create & Send Invoice
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Travel Invoice Dialog */}
        <Dialog open={showCreateTravelInvoice} onOpenChange={setShowCreateTravelInvoice}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Route size={20} />
                Create Invoice from Travel Entries
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number *</Label>
                  <Input
                    value={travelInvoiceForm.number}
                    onChange={(e) => setTravelInvoiceForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="TRV-2024-001"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={travelInvoiceForm.status} 
                    onValueChange={(value: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled') => setTravelInvoiceForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client and Case Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client *</Label>
                  <Select 
                    value={travelInvoiceForm.clientId} 
                    onValueChange={handleTravelClientChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Case (Optional)</Label>
                  <Select 
                    value={travelInvoiceForm.caseId} 
                    onValueChange={handleTravelCaseChange}
                    disabled={!travelInvoiceForm.clientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCases
                        .filter(case_ => case_.clientId === travelInvoiceForm.clientId)
                        .map(case_ => (
                          <SelectItem key={case_.id} value={case_.id}>{case_.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={travelInvoiceForm.date}
                    onChange={(e) => setTravelInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={travelInvoiceForm.dueDate}
                    onChange={(e) => setTravelInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Travel Entries Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Select Travel Entries</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allIds = travelEntries.map(entry => entry.id);
                        setSelectedTravelEntries(allIds);
                        
                        // Update invoice form with all entries
                        const items = travelEntries.map(entry => ({
                          description: `Travel: ${entry.from} to ${entry.to} - ${entry.clientName}`,
                          quantity: 1,
                          rate: entry.overallTotal,
                          amount: entry.overallTotal
                        }));

                        const totals = calculateTravelInvoiceTotals(travelEntries);
                        
                        setTravelInvoiceForm(prev => ({
                          ...prev,
                          items,
                          selectedTravelEntries: allIds,
                          subtotal: totals.subtotal,
                          discountAmount: totals.discountAmount,
                          taxAmount: totals.taxAmount,
                          total: totals.total
                        }));
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTravelEntries([]);
                        setTravelInvoiceForm(prev => ({ ...prev, items: [], subtotal: 0, taxAmount: 0, total: 0 }));
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {travelEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTravelEntries.includes(entry.id)}
                              onCheckedChange={(checked) => 
                                handleTravelEntrySelection(entry.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>{entry.clientName}</TableCell>
                          <TableCell>{entry.from} → {entry.to}</TableCell>
                          <TableCell>{entry.totalKm}km</TableCell>
                          <TableCell>{entry.hoursSpent}h</TableCell>
                          <TableCell className="font-bold">{formatCurrency(entry.overallTotal)}</TableCell>
                          <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {travelEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No travel entries available.
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Invoice Calculations */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={travelInvoiceForm.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value) || 0;
                        setTravelInvoiceForm(prev => ({ ...prev, taxRate }));
                        
                        // Recalculate totals
                        const selectedEntries = travelEntries.filter(entry => 
                          selectedTravelEntries.includes(entry.id)
                        );
                        const totals = calculateTravelInvoiceTotals(selectedEntries);
                        setTravelInvoiceForm(prev => ({ 
                          ...prev, 
                          taxRate,
                          taxAmount: totals.taxAmount,
                          total: totals.total 
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Discount Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={travelInvoiceForm.discountRate}
                      onChange={(e) => {
                        const discountRate = parseFloat(e.target.value) || 0;
                        setTravelInvoiceForm(prev => ({ ...prev, discountRate }));
                        
                        // Recalculate totals
                        const selectedEntries = travelEntries.filter(entry => 
                          selectedTravelEntries.includes(entry.id)
                        );
                        const totals = calculateTravelInvoiceTotals(selectedEntries);
                        setTravelInvoiceForm(prev => ({ 
                          ...prev, 
                          discountRate,
                          discountAmount: totals.discountAmount,
                          taxAmount: totals.taxAmount,
                          total: totals.total 
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(travelInvoiceForm.subtotal)}</span>
                  </div>
                  {travelInvoiceForm.discountRate > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({travelInvoiceForm.discountRate}%):</span>
                      <span className="font-mono">-{formatCurrency(travelInvoiceForm.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({travelInvoiceForm.taxRate}%):</span>
                    <span className="font-mono">{formatCurrency(travelInvoiceForm.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(travelInvoiceForm.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={travelInvoiceForm.notes}
                    onChange={(e) => setTravelInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the client..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={travelInvoiceForm.terms}
                    onChange={(e) => setTravelInvoiceForm(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Payment terms and conditions..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateTravelInvoice(false)}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setTravelInvoiceForm(prev => ({ ...prev, status: 'draft' }));
                      saveTravelInvoice();
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={() => {
                      setTravelInvoiceForm(prev => ({ ...prev, status: 'sent' }));
                      saveTravelInvoice();
                    }}
                  >
                    Create & Send Invoice
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TimeTracking;
