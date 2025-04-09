
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  Cell,
  Pie,
  PieChart
} from "recharts";

// Sample data for revenue chart
const revenueData = [
  { name: "Jan", revenue: 12500 },
  { name: "Feb", revenue: 15000 },
  { name: "Mar", revenue: 18000 },
  { name: "Apr", revenue: 16000 },
  { name: "May", revenue: 21000 },
  { name: "Jun", revenue: 19500 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <BarChartIcon size={16} />
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={revenueData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#56B99F" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#56B99F" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Revenue"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#56B99F"
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
