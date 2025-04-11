
import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface FinancialChartProps {
  dateRange: "month" | "quarter" | "year";
}

export const FinancialChart = ({ dateRange }: FinancialChartProps) => {
  // Generate data based on date range
  const getData = () => {
    if (dateRange === "month") {
      return [
        { name: "Week 1", revenue: 42000, expenses: 28000, profit: 14000 },
        { name: "Week 2", revenue: 38000, expenses: 24000, profit: 14000 },
        { name: "Week 3", revenue: 45000, expenses: 29000, profit: 16000 },
        { name: "Week 4", revenue: 39000, expenses: 26000, profit: 13000 },
      ];
    } else if (dateRange === "quarter") {
      return [
        { name: "Jan", revenue: 125000, expenses: 75000, profit: 50000 },
        { name: "Feb", revenue: 118000, expenses: 72000, profit: 46000 },
        { name: "Mar", revenue: 132000, expenses: 78000, profit: 54000 },
      ];
    } else {
      return [
        { name: "Q1", revenue: 375000, expenses: 225000, profit: 150000 },
        { name: "Q2", revenue: 420000, expenses: 245000, profit: 175000 },
        { name: "Q3", revenue: 390000, expenses: 230000, profit: 160000 },
        { name: "Q4", revenue: 450000, expenses: 260000, profit: 190000 },
      ];
    }
  };

  const data = getData();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3a86ff" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3a86ff" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis tick={{ fill: '#64748b' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }} 
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stackId="1" 
          stroke="#3a86ff" 
          fill="url(#colorRevenue)"
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stackId="2" 
          stroke="#ef4444" 
          fill="url(#colorExpenses)"
        />
        <Area 
          type="monotone" 
          dataKey="profit" 
          stackId="3" 
          stroke="#10b981" 
          fill="url(#colorProfit)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
