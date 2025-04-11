
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface ClientAnalyticsReportProps {
  dateRange: "month" | "quarter" | "year";
}

export const ClientAnalyticsReport = ({ dateRange }: ClientAnalyticsReportProps) => {
  // Sample top clients data
  const topClients = [
    { 
      id: 1, 
      name: "Westfield Corp", 
      type: "Corporate", 
      activeCases: 3, 
      totalBilled: 86500, 
      totalPaid: 78200, 
      retention: 3.2 
    },
    { 
      id: 2, 
      name: "Oceanview Properties", 
      type: "Real Estate", 
      activeCases: 2, 
      totalBilled: 64300, 
      totalPaid: 64300, 
      retention: 2.8 
    },
    { 
      id: 3, 
      name: "Brightline Technologies", 
      type: "Technology", 
      activeCases: 1, 
      totalBilled: 48750, 
      totalPaid: 32500, 
      retention: 1.5 
    },
    { 
      id: 4, 
      name: "Davidson Family Trust", 
      type: "Estate", 
      activeCases: 1, 
      totalBilled: 42000, 
      totalPaid: 42000, 
      retention: 4.5 
    },
    { 
      id: 5, 
      name: "QuickServe Media", 
      type: "Media", 
      activeCases: 2, 
      totalBilled: 38900, 
      totalPaid: 24600, 
      retention: 1.2 
    }
  ];
  
  // Sample client acquisition data
  const clientAcquisition = [
    { name: "Referral", value: 45 },
    { name: "Website", value: 20 },
    { name: "Networking", value: 15 },
    { name: "Marketing", value: 12 },
    { name: "Other", value: 8 },
  ];
  
  // Sample client revenue by industry
  const revenueByIndustry = [
    { name: "Corporate", revenue: 186000 },
    { name: "Real Estate", revenue: 124000 },
    { name: "Technology", revenue: 95000 },
    { name: "Estate", revenue: 78000 },
    { name: "Media", revenue: 65000 },
  ];
  
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Client Acquisition Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientAcquisition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {clientAcquisition.map((entry, index) => (
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
            <CardTitle className="text-md font-medium">Revenue by Client Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueByIndustry}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Active Cases</TableHead>
                <TableHead>Total Billed</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Retention (Years)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>{client.activeCases}</TableCell>
                  <TableCell>${client.totalBilled.toLocaleString()}</TableCell>
                  <TableCell>${client.totalPaid.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={client.totalPaid / client.totalBilled >= 0.9 ? "default" : 
                                  client.totalPaid / client.totalBilled >= 0.5 ? "outline" : "destructive"}>
                      {client.totalPaid / client.totalBilled >= 0.9 ? "Paid" : 
                       client.totalPaid / client.totalBilled >= 0.5 ? "Partial" : "Overdue"}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.retention} years</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
