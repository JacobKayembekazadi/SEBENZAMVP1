import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  
  // Mock data - replace with real data from your APIs
  const [dashboardData, setDashboardData] = useState({
    outstandingInvoices: {
      count: 12,
      amount: 45750,
      overdue: 3
    },
    outstandingQuotes: {
      count: 8,
      amount: 32400,
      expiringSoon: 2
    },
    totalProfits: 128950,
    totalIncome: 285400,
    totalExpenses: 156450,
    unbilledTime: {
      hours: 42.5,
      amount: 21250
    },
    recentActivity: [
      { type: 'invoice', action: 'paid', client: 'ABC Corp', amount: 5500, time: '2 hours ago' },
      { type: 'quote', action: 'sent', client: 'XYZ Ltd', amount: 3200, time: '4 hours ago' },
      { type: 'expense', action: 'added', description: 'Office supplies', amount: 450, time: '6 hours ago' }
    ]
  });

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

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back, Jessica. Here's what's happening with your firm today."
    >
      <div className={`transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Financial Dashboard
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome back! Here's your practice overview for today.
            </p>
          </div>
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

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Outstanding Invoices */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100/70 dark:bg-red-900/30 backdrop-blur-sm rounded-lg">
                  <Receipt size={20} className="text-red-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Outstanding Invoices</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.outstandingInvoices.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs backdrop-blur-sm">
                      {dashboardData.outstandingInvoices.count} invoices
                    </Badge>
                    {dashboardData.outstandingInvoices.overdue > 0 && (
                      <Badge variant="destructive" className="text-xs backdrop-blur-sm">
                        {dashboardData.outstandingInvoices.overdue} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Quotes */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100/70 dark:bg-yellow-900/30 backdrop-blur-sm rounded-lg">
                  <FileText size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Outstanding Quotes</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.outstandingQuotes.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs backdrop-blur-sm">
                      {dashboardData.outstandingQuotes.count} quotes
                    </Badge>
                    {dashboardData.outstandingQuotes.expiringSoon > 0 && (
                      <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                        {dashboardData.outstandingQuotes.expiringSoon} expiring soon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Profits */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100/70 dark:bg-green-900/30 backdrop-blur-sm rounded-lg">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Profits</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.totalProfits)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">+12.5% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Income</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.totalIncome)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">+8.2% this quarter</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100/70 dark:bg-purple-900/30 backdrop-blur-sm rounded-lg">
                  <Wallet size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Expenses</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.totalExpenses)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownRight size={12} className="text-red-600" />
                    <span className="text-xs text-red-600">+5.1% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unbilled Time */}
        <Card className={`${isDark ? 'glass-dark' : 'glass-card'} mb-8`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100/70 dark:bg-orange-900/30 backdrop-blur-sm rounded-lg">
                  <Timer size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Unbilled Time
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {dashboardData.unbilledTime.hours} hours • {formatCurrency(dashboardData.unbilledTime.amount)} potential revenue
                  </p>
                </div>
              </div>
              <Button 
                className="bg-orange-600/90 hover:bg-orange-700/90 text-white backdrop-blur-sm"
                onClick={() => navigate('/invoices/create?source=dashboard&prefill=unbilled')}
              >
                <Receipt size={16} className="mr-2" />
                Create Invoice
              </Button>
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

        {/* Upcoming Tasks Section - Keeping from original */}
        <Card className={`${isDark ? 'glass-dark' : 'glass-card'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CalendarClock size={16} />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300/50 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Prepare documents for Westfield case hearing
                </p>
                <div className="flex items-center mt-1">
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CalendarClock size={12} className="mr-1" />
                    Apr 10, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={12} className="mr-1" />
                    Michael Thompson
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300/50 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Review contract for Brightline Technologies
                </p>
                <div className="flex items-center mt-1">
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CalendarClock size={12} className="mr-1" />
                    Apr 11, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={12} className="mr-1" />
                    Sarah Williams
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300/50 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Client meeting with Oceanview Properties
                </p>
                <div className="flex items-center mt-1">
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CalendarClock size={12} className="mr-1" />
                    Apr 12, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={12} className="mr-1" />
                    Jessica Chen
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;