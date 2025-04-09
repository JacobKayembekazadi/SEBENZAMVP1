
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, UserPlus } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@johnson.com",
    company: "Johnson & Associates",
    phone: "(555) 123-4567",
    cases: 3,
    status: "active",
    avatar: "/placeholder.svg",
    initials: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@chenenterprises.com",
    company: "Chen Enterprises",
    phone: "(555) 987-6543",
    cases: 2, 
    status: "active",
    avatar: "/placeholder.svg",
    initials: "MC",
  },
  {
    id: 3,
    name: "Amanda Rodriguez",
    email: "amanda@rodriguez.com",
    company: "Rodriguez & Family",
    phone: "(555) 321-9876",
    cases: 1,
    status: "active",
    avatar: "/placeholder.svg", 
    initials: "AR",
  },
  {
    id: 4,
    name: "Robert Williams",
    email: "robert@williamsconstruction.com",
    company: "Williams Construction",
    phone: "(555) 456-7890",
    cases: 1,
    status: "inactive",
    avatar: "/placeholder.svg",
    initials: "RW",
  },
  {
    id: 5,
    name: "Jennifer Thompson",
    email: "jennifer@thompsonlegal.com",
    company: "Thompson Legal",
    phone: "(555) 234-5678",
    cases: 2,
    status: "active",
    avatar: "/placeholder.svg",
    initials: "JT",
  },
  {
    id: 6,
    name: "David Wilson",
    email: "david@wilson.com",
    company: "Wilson Enterprises",
    phone: "(555) 876-5432",
    cases: 0,
    status: "inactive",
    avatar: "/placeholder.svg",
    initials: "DW",
  },
];

const Clients = () => {
  return (
    <DashboardLayout title="Clients">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships and information
          </p>
        </div>
        <Button>
          <UserPlus size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search clients..." 
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
              <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Cases</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{client.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.company}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{client.email}</td>
                <td className="py-3 px-4">{client.phone}</td>
                <td className="py-3 px-4">{client.cases}</td>
                <td className="py-3 px-4">
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
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

export default Clients;
