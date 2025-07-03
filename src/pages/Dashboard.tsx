import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { 
  DollarSign, 
  Users, 
  FolderClosed, 
  Clock,
  Plus,
  Moon,
  Sun,
  FileText,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Timer,
  Building2,
  Banknote,
  Target,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Send,
  Link,
  Zap,
  Activity,
  CalendarClock
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  
  // Real dashboard data from API
  const [dashboardData, setDashboardData] = useState({
    totals: {
      activeClients: 0,
      activeCases: 0,
      pendingInvoices: 0,
      outstandingRevenue: 0
    },
    revenue: {
      monthly: 0,
      yearly: 0
    },
    recentActivity: []
  });

  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      title: 'Prepare documents for Westfield case hearing', 
      dueDate: '2025-04-10', 
      assignedTo: 'Michael Thompson',
      completed: false,
      priority: 'high'
    },
    { 
      id: '2', 
      title: 'Review contract for Brightline Technologies', 
      dueDate: '2025-04-11', 
      assignedTo: 'Sarah Williams',
      completed: false,
      priority: 'medium'
    },
    { 
      id: '3', 
      title: 'Client meeting with Oceanview Properties', 
      dueDate: '2025-04-12', 
      assignedTo: 'Jessica Chen',
      completed: false,
      priority: 'high'
    }
  ]);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    assignedTo: '',
    priority: 'medium'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
                 // For now, use mock data since reports API might not be available
         const data = {
           totals: {
             activeClients: 25,
             activeCases: 18,
             pendingInvoices: 12,
             outstandingRevenue: 45750
           },
           revenue: {
             monthly: 32400,
             yearly: 285400
           },
           recentActivity: [
             { type: 'invoice', action: 'paid', client: 'ABC Corp', amount: 5500, time: '2 hours ago' },
             { type: 'case', action: 'created', client: 'XYZ Ltd', amount: 3200, time: '4 hours ago' },
             { type: 'expense', action: 'added', description: 'Office supplies', amount: 450, time: '6 hours ago' }
           ]
         };
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        // Use fallback data for development
        setDashboardData({
          totals: {
            activeClients: 25,
            activeCases: 18,
            pendingInvoices: 12,
            outstandingRevenue: 45750
          },
          revenue: {
            monthly: 32400,
            yearly: 285400
    },
    recentActivity: [
      { type: 'invoice', action: 'paid', client: 'ABC Corp', amount: 5500, time: '2 hours ago' },
            { type: 'case', action: 'created', client: 'XYZ Ltd', amount: 3200, time: '4 hours ago' },
      { type: 'expense', action: 'added', description: 'Office supplies', amount: 450, time: '6 hours ago' }
    ]
  });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Task CRUD operations
  const handleCreateTask = () => {
    if (newTask.title && newTask.dueDate) {
      const task = {
        id: Date.now().toString(),
        ...newTask,
        completed: false
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', dueDate: '', assignedTo: '', priority: 'medium' });
      setShowTaskDialog(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task);
    setShowTaskDialog(true);
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.title && newTask.dueDate) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...editingTask, ...newTask } : task
      ));
      setEditingTask(null);
      setNewTask({ title: '', dueDate: '', assignedTo: '', priority: 'medium' });
      setShowTaskDialog(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const QuickActionCard = ({ icon, title, description, buttonText, buttonAction, color = "blue" }: any) => (
    <Card className={`${isDark ? 'glass-dark' : 'glass-card'} hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            color === 'blue' ? 'bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm' :
            color === 'green' ? 'bg-green-100/70 dark:bg-green-900/30 backdrop-blur-sm' :
            color === 'purple' ? 'bg-purple-100/70 dark:bg-purple-900/30 backdrop-blur-sm' :
            color === 'red' ? 'bg-red-100/70 dark:bg-red-900/30 backdrop-blur-sm' :
            color === 'teal' ? 'bg-teal-100/70 dark:bg-teal-900/30 backdrop-blur-sm' :
            color === 'indigo' ? 'bg-indigo-100/70 dark:bg-indigo-900/30 backdrop-blur-sm' :
            'bg-gray-100/70 dark:bg-gray-900/30 backdrop-blur-sm'
          }`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
            <Button 
              className={`${
                color === 'blue' ? 'bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm' :
                color === 'green' ? 'bg-green-600/90 hover:bg-green-700/90 backdrop-blur-sm' :
                color === 'purple' ? 'bg-purple-600/90 hover:bg-purple-700/90 backdrop-blur-sm' :
                color === 'red' ? 'bg-red-600/90 hover:bg-red-700/90 backdrop-blur-sm' :
                color === 'teal' ? 'bg-teal-600/90 hover:bg-teal-700/90 backdrop-blur-sm' :
                color === 'indigo' ? 'bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-sm' :
                'bg-gray-600/90 hover:bg-gray-700/90 backdrop-blur-sm'
              } text-white`}
              onClick={buttonAction}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" description="Loading dashboard data...">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" description="Error loading dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Unable to load dashboard
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back, Jessica. Here's what's happening with your firm today."
    >
      <div className={`transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header with Dark Mode Toggle and Refresh */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Financial Dashboard
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome back! Here's your practice overview for today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className={isDark ? 'border-gray-600 text-gray-300 hover:text-white glass-dark' : 'glass'}
            >
              <Activity size={16} className="mr-2" />
              Refresh
            </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={isDark ? 'border-gray-600 text-gray-300 hover:text-white glass-dark' : 'glass'}
          >
            {isDark ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Active Clients */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active Clients</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.totals.activeClients}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">+12% this month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Cases */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100/70 dark:bg-purple-900/30 backdrop-blur-sm rounded-lg">
                  <FolderClosed size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active Cases</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.totals.activeCases}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">+8% this quarter</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invoices */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100/70 dark:bg-red-900/30 backdrop-blur-sm rounded-lg">
                  <Receipt size={20} className="text-red-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pending Invoices</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.totals.pendingInvoices}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} className="text-red-600" />
                    <span className="text-xs text-red-600">Needs attention</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100/70 dark:bg-green-900/30 backdrop-blur-sm rounded-lg">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Monthly Revenue</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.revenue.monthly)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">+15.2% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Revenue */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100/70 dark:bg-orange-900/30 backdrop-blur-sm rounded-lg">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Outstanding Revenue</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.totals.outstandingRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Timer size={12} className="text-orange-600" />
                    <span className="text-xs text-orange-600">Awaiting payment</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management Section */}
        <Card className={`${isDark ? 'glass-dark' : 'glass-card'} mb-8`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg">
                  <CalendarClock size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Task Management
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {tasks.filter(t => !t.completed).length} pending tasks • {tasks.filter(t => t.priority === 'high').length} high priority
                  </p>
                </div>
              </div>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm"
                    onClick={() => {
                      setEditingTask(null);
                      setNewTask({ title: '', dueDate: '', assignedTo: '', priority: 'medium' });
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <DialogHeader>
                    <DialogTitle className={isDark ? 'text-white' : ''}>
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                    <DialogDescription className={isDark ? 'text-gray-300' : ''}>
                      {editingTask ? 'Update the task details below.' : 'Add a new task to your dashboard.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className={isDark ? 'text-white' : ''}>Task Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        placeholder="Enter task title..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate" className={isDark ? 'text-white' : ''}>Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assignedTo" className={isDark ? 'text-white' : ''}>Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        placeholder="Enter assignee name..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority" className={isDark ? 'text-white' : ''}>Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                        <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
              <Button 
                      type="submit" 
                      onClick={editingTask ? handleUpdateTask : handleCreateTask}
                      className="bg-blue-600 hover:bg-blue-700"
              >
                      {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            icon={<Users size={24} className="text-blue-600" />}
            title="Add Your Client"
            description="Expand your client base and grow your practice with new client onboarding."
            buttonText="Add Client"
            buttonAction={() => navigate('/clients/create?source=dashboard')}
            color="blue"
          />

          <QuickActionCard
            icon={<Receipt size={24} className="text-green-600" />}
            title="Create Invoice & Get Paid"
            description="Generate professional invoices and streamline your payment collection process."
            buttonText="Create Invoice"
            buttonAction={() => navigate('/invoices/create?source=dashboard')}
            color="green"
          />

          <QuickActionCard
            icon={<Target size={24} className="text-purple-600" />}
            title="Secure a New Deal"
            description="Create compelling estimates and quotes to win new business opportunities."
            buttonText="Create Quote"
            buttonAction={() => navigate('/estimates/create?source=dashboard')}
            color="purple"
          />

          <QuickActionCard
            icon={<Wallet size={24} className="text-red-600" />}
            title="Track Your Spending"
            description="Monitor expenses and connect your bank account for automated expense tracking."
            buttonText="Add Expense"
            buttonAction={() => navigate('/expenses/create?source=dashboard')}
            color="red"
          />

          <QuickActionCard
            icon={<Building2 size={24} className="text-teal-600" />}
            title="Connect Bank Account"
            description="Sync your bank transactions for automatic expense categorization and reconciliation."
            buttonText="Connect Bank"
            buttonAction={() => navigate('/settings/connect-bank?source=dashboard')}
            color="teal"
          />

          <QuickActionCard
            icon={<CreditCard size={24} className="text-indigo-600" />}
            title="Payment Gateway"
            description="Set up online payment processing to get paid faster with secure payment gateways."
            buttonText="Setup Payments"
            buttonAction={() => navigate('/settings/payment-gateways?source=dashboard')}
            color="indigo"
          />
        </div>

        {/* Financial Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card className={`lg:col-span-2 ${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 size={20} />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300/30 rounded-lg">
                <div className="text-center">
                  <PieChart size={48} className={`mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Revenue chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Activity size={20} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'invoice' ? 'bg-green-100/70 dark:bg-green-900/30 backdrop-blur-sm' :
                      activity.type === 'quote' ? 'bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm' :
                      'bg-red-100/70 dark:bg-red-900/30 backdrop-blur-sm'
                    }`}>
                      {activity.type === 'invoice' ? <Receipt size={14} className="text-green-600" /> :
                       activity.type === 'quote' ? <FileText size={14} className="text-blue-600" /> :
                       <Wallet size={14} className="text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activity.type === 'invoice' ? `Invoice ${activity.action}` :
                         activity.type === 'quote' ? `Quote ${activity.action}` :
                         `Expense ${activity.action}`}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activity.client || activity.description} • {formatCurrency(activity.amount)}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Gateway Integration Status */}
        <Card className={`${isDark ? 'glass-dark' : 'glass-card'} mb-6`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Zap size={20} />
              Payment Gateway Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Stripe</span>
                </div>
                <Badge variant="outline" className="text-green-600 backdrop-blur-sm">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>PayPal</span>
                </div>
                <Badge variant="outline" className="backdrop-blur-sm">Not Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Bank Transfer</span>
                </div>
                <Badge variant="outline" className="backdrop-blur-sm">Not Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks Section - Enhanced with CRUD */}
        <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
            <CardTitle className={`text-lg font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CalendarClock size={16} />
                Upcoming Tasks ({tasks.filter(t => !t.completed).length})
            </CardTitle>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm"
                    onClick={() => {
                      setEditingTask(null);
                      setNewTask({ title: '', dueDate: '', assignedTo: '', priority: 'medium' });
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <DialogHeader>
                    <DialogTitle className={isDark ? 'text-white' : ''}>
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                    <DialogDescription className={isDark ? 'text-gray-300' : ''}>
                      {editingTask ? 'Update the task details below.' : 'Add a new task to your dashboard.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className={isDark ? 'text-white' : ''}>Task Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        placeholder="Enter task title..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate" className={isDark ? 'text-white' : ''}>Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assignedTo" className={isDark ? 'text-white' : ''}>Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                        className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        placeholder="Enter assignee name..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority" className={isDark ? 'text-white' : ''}>Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                        <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline"
                      onClick={() => setShowTaskDialog(false)}
                      className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={editingTask ? handleUpdateTask : handleCreateTask}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
              <div className="flex-shrink-0 mt-1">
                  <div 
                    className={`w-5 h-5 border border-gray-300/50 rounded flex items-center justify-center cursor-pointer hover:border-primary ${
                      task.completed ? 'bg-green-500 border-green-500' : ''
                    }`}
                    onClick={() => handleToggleTask(task.id)}
                  >
                    {task.completed && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${
                      task.completed ? 'line-through opacity-60' : ''
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTask(task)}
                        className="h-6 w-6 p-0 hover:bg-blue-500/20"
                      >
                        <Eye size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-500"
                      >
                        ×
                      </Button>
                  </div>
                  </div>
                <div className="flex items-center mt-1">
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CalendarClock size={12} className="mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                    {task.assignedTo && (
                      <>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={12} className="mr-1" />
                          {task.assignedTo}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <CalendarClock size={48} className={`mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No tasks yet. Click "Add Task" to get started.</p>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;