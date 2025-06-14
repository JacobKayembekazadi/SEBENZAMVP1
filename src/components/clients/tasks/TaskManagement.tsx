import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock,
  User,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { Client } from '@/lib/store';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: 'follow-up' | 'reminder' | 'deadline' | 'meeting' | 'document' | 'payment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  attachments?: { name: string; url: string }[];
  comments: {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
  }[];
}

interface TaskManagementProps {
  client: Client;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  teamMembers?: { id: string; name: string; role: string }[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    clientId: '1',
    title: 'Follow up on contract review',
    description: 'Check if client has reviewed the updated contract terms and needs clarification',
    type: 'follow-up',
    priority: 'high',
    status: 'pending',
    assignedTo: 'John Attorney',
    assignedBy: 'John Attorney',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    comments: []
  },
  {
    id: '2',
    clientId: '1',
    title: 'Schedule quarterly review meeting',
    description: 'Set up quarterly business review with client to discuss ongoing matters',
    type: 'meeting',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Jane Paralegal',
    assignedBy: 'John Attorney',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    recurring: {
      frequency: 'monthly',
      interval: 3
    },
    comments: [
      {
        id: '1',
        content: 'Client prefers morning meetings',
        author: 'Jane Paralegal',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '3',
    clientId: '1',
    title: 'Payment reminder - Invoice #2024-001',
    description: 'Send payment reminder for overdue invoice',
    type: 'payment',
    priority: 'urgent',
    status: 'overdue',
    assignedTo: 'John Attorney',
    assignedBy: 'System',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    comments: []
  }
];

const teamMembers = [
  { id: '1', name: 'John Attorney', role: 'Senior Attorney' },
  { id: '2', name: 'Jane Paralegal', role: 'Paralegal' },
  { id: '3', name: 'Mike Assistant', role: 'Legal Assistant' }
];

export function TaskManagement({ client, onAddTask, onUpdateTask }: TaskManagementProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter(t => t.clientId === client.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'follow-up' as Task['type'],
    priority: 'medium' as Task['priority'],
    assignedTo: 'John Attorney',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    recurring: undefined as Task['recurring']
  });

  const taskTypeColors = {
    'follow-up': 'bg-blue-100 text-blue-800',
    'reminder': 'bg-yellow-100 text-yellow-800',
    'deadline': 'bg-red-100 text-red-800',
    'meeting': 'bg-purple-100 text-purple-800',
    'document': 'bg-green-100 text-green-800',
    'payment': 'bg-orange-100 text-orange-800',
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
  };

  const statusColors = {
    'pending': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const upcomingTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    isAfter(task.dueDate, new Date()) &&
    isBefore(task.dueDate, addDays(new Date(), 7))
  );

  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    isBefore(task.dueDate, new Date())
  );

  const todayTasks = tasks.filter(task => 
    isToday(task.dueDate) && task.status !== 'completed'
  );

  const handleAddTask = () => {
    const task: Task = {
      id: String(Date.now()),
      clientId: client.id,
      assignedBy: 'John Attorney',
      status: 'pending',
      createdAt: new Date(),
      comments: [],
      ...newTask
    };
    
    setTasks(prev => [task, ...prev]);
    onAddTask(newTask);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      type: 'follow-up',
      priority: 'medium',
      assignedTo: 'John Attorney',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      recurring: undefined
    });
    
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Task Created',
      description: `Task "${task.title}" has been assigned to ${task.assignedTo}.`,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : undefined
          }
        : task
    ));
    
    onUpdateTask(taskId, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined
    });
  };

  const getDueDateStatus = (dueDate: Date, status: Task['status']) => {
    if (status === 'completed') return 'completed';
    if (isBefore(dueDate, new Date())) return 'overdue';
    if (isToday(dueDate)) return 'due-today';
    if (isBefore(dueDate, addDays(new Date(), 3))) return 'due-soon';
    return 'on-time';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    className="h-24"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newTask.type}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value as Task['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}
                    >
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assign to</Label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.name}>
                            {member.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={format(newTask.dueDate, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewTask(prev => ({ 
                        ...prev, 
                        dueDate: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="today">
                Today ({todayTasks.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const dueDateStatus = getDueDateStatus(task.dueDate, task.status);
                  
                  return (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={taskTypeColors[task.type]}>
                              {task.type}
                            </Badge>
                            <Badge className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                            <Badge className={statusColors[task.status]}>
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignedTo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {format(task.dueDate, 'MMM d, yyyy h:mm a')}
                            </span>
                            {task.recurring && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Recurring {task.recurring.frequency}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {dueDateStatus === 'overdue' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          
                          <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {task.comments.length > 0 && (
                        <div className="border-t pt-2 space-y-1">
                          <span className="text-xs font-medium">Latest Comment:</span>
                          <p className="text-xs text-muted-foreground">
                            {task.comments[task.comments.length - 1].content} 
                            <span className="ml-2">- {task.comments[task.comments.length - 1].author}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tasks found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Similar TabsContent for today, upcoming, and overdue */}
          <TabsContent value="today">
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id} className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{task.title}</span>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overdue">
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div key={task.id} className="border rounded-lg p-3 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{task.title}</span>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <p className="text-xs text-red-600">
                        Overdue by {Math.ceil((new Date().getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    <Badge variant="destructive">
                      OVERDUE
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 