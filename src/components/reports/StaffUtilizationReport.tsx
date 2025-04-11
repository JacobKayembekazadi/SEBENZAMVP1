
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface StaffUtilizationReportProps {
  dateRange: "month" | "quarter" | "year";
}

export const StaffUtilizationReport = ({ dateRange }: StaffUtilizationReportProps) => {
  // Sample attorney utilization data
  const attorneyData = [
    {
      id: 1,
      name: "Jessica Chen",
      role: "Senior Partner",
      billableHours: 145,
      targetHours: 160,
      utilization: 90.6,
      revenue: 72500,
      avatar: "/placeholder.svg",
      initials: "JC",
    },
    {
      id: 2,
      name: "Michael Thompson",
      role: "Partner",
      billableHours: 138,
      targetHours: 160,
      utilization: 86.3,
      revenue: 62100,
      avatar: "/placeholder.svg",
      initials: "MT",
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "Senior Associate",
      billableHours: 155,
      targetHours: 160,
      utilization: 96.9,
      revenue: 58125,
      avatar: "/placeholder.svg",
      initials: "SW",
    },
    {
      id: 4,
      name: "Robert Patel",
      role: "Associate",
      billableHours: 148,
      targetHours: 160,
      utilization: 92.5,
      revenue: 44400,
      avatar: "/placeholder.svg",
      initials: "RP",
    },
    {
      id: 5,
      name: "Emily Rodriguez",
      role: "Junior Associate",
      billableHours: 132,
      targetHours: 160,
      utilization: 82.5,
      revenue: 33000,
      avatar: "/placeholder.svg",
      initials: "ER",
    },
  ];
  
  // Sample time allocation data
  const timeAllocationData = [
    { name: "Jessica Chen", billable: 145, admin: 25, business: 20 },
    { name: "Michael Thompson", billable: 138, admin: 30, business: 15 },
    { name: "Sarah Williams", billable: 155, admin: 15, business: 10 },
    { name: "Robert Patel", billable: 148, admin: 20, business: 12 },
    { name: "Emily Rodriguez", billable: 132, admin: 18, business: 10 },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Attorney Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attorney</TableHead>
                <TableHead>Billable Hours</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Revenue Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attorneyData.map((attorney) => (
                <TableRow key={attorney.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attorney.avatar} alt={attorney.name} />
                        <AvatarFallback>{attorney.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attorney.name}</p>
                        <p className="text-xs text-muted-foreground">{attorney.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{attorney.billableHours}</TableCell>
                  <TableCell>{attorney.targetHours}</TableCell>
                  <TableCell>
                    <div className="w-40">
                      <div className="flex justify-between mb-1 text-xs">
                        <span>{attorney.utilization}%</span>
                      </div>
                      <Progress value={attorney.utilization} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>${attorney.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Time Allocation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeAllocationData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="billable" stackId="a" fill="#2563eb" name="Billable Hours" />
                <Bar dataKey="admin" stackId="a" fill="#f59e0b" name="Administrative" />
                <Bar dataKey="business" stackId="a" fill="#10b981" name="Business Development" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
