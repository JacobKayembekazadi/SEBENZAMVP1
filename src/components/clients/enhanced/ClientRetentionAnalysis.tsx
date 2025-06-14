import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { Client } from '@/lib/store';
import { differenceInMonths, format, subMonths } from 'date-fns';

interface ClientRetentionAnalysisProps {
  clients: Client[];
}

export function ClientRetentionAnalysis({ clients }: ClientRetentionAnalysisProps) {
  // Calculate retention metrics
  const calculateRetentionMetrics = () => {
    const now = new Date();
    const activeClients = clients.filter(c => c.status === 'active');
    
    // Calculate average client lifetime
    const clientLifetimes = activeClients.map(client => 
      differenceInMonths(now, new Date(client.createdAt))
    );
    const averageLifetime = clientLifetimes.length > 0 
      ? clientLifetimes.reduce((sum, months) => sum + months, 0) / clientLifetimes.length 
      : 0;

    // Calculate retention by cohort (months)
    const cohortData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = subMonths(now, i);
      const monthClients = clients.filter(client => {
        const createdDate = new Date(client.createdAt);
        return createdDate.getMonth() === monthStart.getMonth() && 
               createdDate.getFullYear() === monthStart.getFullYear();
      });
      
      const stillActive = monthClients.filter(c => c.status === 'active').length;
      const retentionRate = monthClients.length > 0 ? (stillActive / monthClients.length) * 100 : 0;
      
      cohortData.push({
        month: format(monthStart, 'MMM yyyy'),
        total: monthClients.length,
        retained: stillActive,
        retentionRate: Math.round(retentionRate)
      });
    }

    // Calculate churn rate
    const inactiveClients = clients.filter(c => c.status === 'inactive').length;
    const churnRate = clients.length > 0 ? (inactiveClients / clients.length) * 100 : 0;

    return {
      averageLifetime: Math.round(averageLifetime),
      totalActive: activeClients.length,
      totalInactive: inactiveClients,
      churnRate: Math.round(churnRate),
      retentionRate: Math.round(100 - churnRate),
      cohortData
    };
  };

  const metrics = calculateRetentionMetrics();

  // Client status distribution
  const statusData = [
    { name: 'Active', value: metrics.totalActive, color: '#10b981' },
    { name: 'Inactive', value: metrics.totalInactive, color: '#ef4444' },
    { name: 'Prospective', value: clients.filter(c => c.status === 'prospective').length, color: '#f59e0b' }
  ];

  // Client lifetime distribution
  const lifetimeData = [
    { range: '0-3 months', count: clients.filter(c => differenceInMonths(new Date(), new Date(c.createdAt)) <= 3).length },
    { range: '3-6 months', count: clients.filter(c => {
      const months = differenceInMonths(new Date(), new Date(c.createdAt));
      return months > 3 && months <= 6;
    }).length },
    { range: '6-12 months', count: clients.filter(c => {
      const months = differenceInMonths(new Date(), new Date(c.createdAt));
      return months > 6 && months <= 12;
    }).length },
    { range: '1+ years', count: clients.filter(c => differenceInMonths(new Date(), new Date(c.createdAt)) > 12).length }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Client Retention Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.retentionRate}%</div>
            <div className="text-sm text-muted-foreground">Retention Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.churnRate}%</div>
            <div className="text-sm text-muted-foreground">Churn Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.averageLifetime}</div>
            <div className="text-sm text-muted-foreground">Avg. Lifetime (months)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalActive}</div>
            <div className="text-sm text-muted-foreground">Active Clients</div>
          </div>
        </div>

        {/* Retention Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Retention</span>
            <span>{metrics.retentionRate}%</span>
          </div>
          <Progress value={metrics.retentionRate} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor (0-60%)</span>
            <span>Good (60-80%)</span>
            <span>Excellent (80%+)</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Status Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Client Status Distribution</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Client Lifetime Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Client Lifetime Distribution</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifetimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Cohort Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Monthly Cohort Retention</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'retentionRate' ? `${value}%` : value,
                    name === 'retentionRate' ? 'Retention Rate' : 
                    name === 'total' ? 'Total Clients' : 'Retained Clients'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="retentionRate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="retentionRate"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Insights
          </h4>
          <div className="text-sm space-y-1">
            {metrics.retentionRate >= 80 && (
              <p className="text-green-700">✓ Excellent retention rate - clients are highly satisfied</p>
            )}
            {metrics.retentionRate < 60 && (
              <p className="text-red-700">⚠ Low retention rate - consider improving client satisfaction</p>
            )}
            {metrics.averageLifetime >= 12 && (
              <p className="text-blue-700">✓ Strong client relationships with good lifetime value</p>
            )}
            {metrics.churnRate > 30 && (
              <p className="text-orange-700">⚠ High churn rate - investigate reasons for client departure</p>
            )}
            <p className="text-muted-foreground">
              Average client stays for {metrics.averageLifetime} months
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 