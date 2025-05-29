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

  // Mock data
  const mockClients = ['Clinsmen', 'ABC Corp', 'XYZ Ltd', 'Legal Partners'];
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

  const updateTimeEntry = (entryId: string, field: string, value: any) => {
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

  const createInvoiceFromTime = () => {
    const totalEntries = timeEntries.filter(entry => !entry.isRunning).length;
    if (totalEntries === 0) {
      toast({
        title: "No Entries",
        description: "No completed time entries to create invoice from.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invoice Created",
      description: `Invoice created with ${totalEntries} time entries.`
    });
  };

  const createInvoiceFromTravel = () => {
    if (travelEntries.length === 0) {
      toast({
        title: "No Travel Entries",
        description: "No travel entries to create invoice from.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Travel Invoice Created",
      description: `Invoice created with ${travelEntries.length} travel entries.`
    });
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
                            <Button variant="ghost" size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
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
                            <Button variant="ghost" size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
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
                        <SelectItem key={client} value={client}>{client}</SelectItem>
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
                        <SelectItem key={client} value={client}>{client}</SelectItem>
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
      </div>
    </DashboardLayout>
  );
};

export default TimeTracking;
