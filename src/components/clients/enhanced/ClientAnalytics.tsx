import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Client } from '@/lib/store';
import { format, subMonths, startOfMonth } from 'date-fns';

interface ClientAnalyticsProps {
  client: Client;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export function ClientAnalytics({ client, timeRange = 'year' }: ClientAnalyticsProps) {
  // Process payment history for charts
  const getPaymentData = () => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = startOfMonth(subMonths(now, i));
      const key = format(month, 'MMM yyyy');
      months[key] = 0;
    }
    
    // Aggregate payments by month
    client.metrics.paymentHistory.forEach(payment => {
      const month = format(new Date(payment.date), 'MMM yyyy');
      if (months[month] !== undefined) {
        months[month] += payment.amount;
      }
    });
    
    return Object.entries(months).map(([month, amount]) => ({
      month,
      amount,
    }));
  };

  const getPaymentStatusData = () => {
    const statusCounts = {
      paid: 0,
      pending: 0,
      overdue: 0,
    };
    
    client.metrics.paymentHistory.forEach(payment => {
      statusCounts[payment.status]++;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  const paymentData = getPaymentData();
  const statusData = getPaymentStatusData();

  const COLORS = {
    paid: '#10b981',
    pending: '#f59e0b',
    overdue: '#ef4444',
  };

  // Calculate growth metrics
  const calculateGrowth = () => {
    const currentMonth = paymentData[paymentData.length - 1]?.amount || 0;
    const previousMonth = paymentData[paymentData.length - 2]?.amount || 0;
    
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  const growth = calculateGrowth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Client Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="status">Payment Status</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Monthly Revenue</h4>
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth}%
                </span>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    labelStyle={{ color: 'black' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <h4 className="text-sm font-medium">Payment Status Distribution</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[entry.name.toLowerCase() as keyof typeof COLORS] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <h4 className="text-sm font-medium">Payment Trends</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Average Payment</span>
                <span className="text-sm font-medium">
                  ${(client.metrics.totalBilling / client.metrics.paymentHistory.length).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Highest Payment</span>
                <span className="text-sm font-medium">
                  ${Math.max(...client.metrics.paymentHistory.map(p => p.amount)).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Payment Frequency</span>
                <span className="text-sm font-medium">
                  {(client.metrics.paymentHistory.length / 12).toFixed(1)} per month
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">On-time Payment Rate</span>
                <span className="text-sm font-medium">
                  {((client.metrics.paymentHistory.filter(p => p.status === 'paid').length / 
                    client.metrics.paymentHistory.length) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 