
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, Search, Filter, Calendar } from "lucide-react";

const cases = [
  {
    id: 1,
    title: "Smith v. Jones LLC",
    client: "Sarah Johnson",
    type: "Corporate Litigation",
    status: "active",
    opened: "Apr 12, 2023",
    nextHearing: "Jun 15, 2023",
    practice: "Corporate",
  },
  {
    id: 2,
    title: "Davidson Estate Planning",
    client: "Robert Davidson",
    type: "Estate Planning",
    status: "pending",
    opened: "Apr 15, 2023",
    nextHearing: "N/A",
    practice: "Estate",
  },
  {
    id: 3,
    title: "Westlake Merger",
    client: "Michael Chen",
    type: "M&A",
    status: "active",
    opened: "Apr 18, 2023",
    nextHearing: "N/A",
    practice: "Corporate",
  },
  {
    id: 4,
    title: "Harris IP Dispute",
    client: "Jennifer Harris",
    type: "Intellectual Property",
    status: "closed",
    opened: "Mar 30, 2023",
    nextHearing: "Completed",
    practice: "IP",
  },
  {
    id: 5,
    title: "Williams Construction Contract",
    client: "Robert Williams",
    type: "Contract Review",
    status: "active",
    opened: "Apr 05, 2023",
    nextHearing: "N/A",
    practice: "Contracts",
  },
  {
    id: 6,
    title: "Thompson v. City of Springfield",
    client: "Amanda Rodriguez",
    type: "Civil Litigation",
    status: "active",
    opened: "Mar 22, 2023",
    nextHearing: "May 18, 2023",
    practice: "Litigation",
  },
];

const Cases = () => {
  return (
    <DashboardLayout title="Cases">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Cases</h2>
          <p className="text-muted-foreground">
            Track and manage all your legal cases
          </p>
        </div>
        <Button>
          <FolderPlus size={16} className="mr-2" />
          New Case
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search cases..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-3 px-4 text-sm font-medium">Case</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Practice Area</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Next Date</th>
              <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => (
              <tr key={caseItem.id} className="border-t hover:bg-muted/50">
                <td className="py-3 px-4">
                  <p className="font-medium">{caseItem.title}</p>
                  <p className="text-xs text-muted-foreground">Opened: {caseItem.opened}</p>
                </td>
                <td className="py-3 px-4">{caseItem.client}</td>
                <td className="py-3 px-4">{caseItem.practice}</td>
                <td className="py-3 px-4">
                  <Badge variant={
                    caseItem.status === "active" ? "default" : 
                    caseItem.status === "pending" ? "outline" : 
                    "secondary"
                  }>
                    {caseItem.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {caseItem.nextHearing !== "N/A" && caseItem.nextHearing !== "Completed" ? (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>{caseItem.nextHearing}</span>
                    </div>
                  ) : (
                    <span>{caseItem.nextHearing}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Cases;
