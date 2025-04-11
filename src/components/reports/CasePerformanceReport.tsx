
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CasePerformanceReportProps {
  dateRange: "month" | "quarter" | "year";
}

export const CasePerformanceReport = ({ dateRange }: CasePerformanceReportProps) => {
  // Sample case distribution data
  const caseDistribution = [
    { name: "Corporate", value: 35 },
    { name: "Litigation", value: 25 },
    { name: "Real Estate", value: 15 },
    { name: "IP", value: 10 },
    { name: "Estate", value: 15 },
  ];
  
  // Sample case performance data
  const casePerformanceData = [
    { name: "Corporate", budgeted: 120, actual: 110 },
    { name: "Litigation", budgeted: 180, actual: 210 },
    { name: "Real Estate", budgeted: 90, actual: 85 },
    { name: "IP", budgeted: 70, actual: 65 },
    { name: "Estate", budgeted: 50, actual: 45 },
  ];
  
  // Sample top performing cases
  const topPerformingCases = [
    { id: "LC-2025-042", name: "Westfield Corp v. Horizon Industries", type: "Corporate", hours: 120, revenue: 48000, margin: 38 },
    { id: "RE-2025-027", name: "Oceanview Properties Contract", type: "Real Estate", hours: 85, revenue: 34000, margin: 42 },
    { id: "IP-2025-033", name: "Brightline Technologies IP", type: "IP", hours: 65, revenue: 32500, margin: 48 },
    { id: "EP-2025-018", name: "Davidson Estate Planning", type: "Estate", hours: 45, revenue: 22500, margin: 45 },
    { id: "LC-2025-039", name: "QuickServe Media Litigation", type: "Litigation", hours: 95, revenue: 42750, margin: 35 },
  ];
  
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Case Distribution by Practice Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {caseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Budgeted vs. Actual Hours by Practice Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={casePerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#2563eb" name="Budgeted Hours" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Top Performing Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Case Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformingCases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.id}</TableCell>
                  <TableCell>{caseItem.name}</TableCell>
                  <TableCell>{caseItem.type}</TableCell>
                  <TableCell>{caseItem.hours}</TableCell>
                  <TableCell>${caseItem.revenue.toLocaleString()}</TableCell>
                  <TableCell>{caseItem.margin}%</TableCell>
                  <TableCell>
                    <Badge variant={caseItem.margin > 40 ? "default" : "secondary"}>
                      {caseItem.margin > 40 ? "Excellent" : "Good"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
