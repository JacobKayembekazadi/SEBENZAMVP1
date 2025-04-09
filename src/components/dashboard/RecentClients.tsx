
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentClients = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Johnson & Associates",
    avatar: "/placeholder.svg",
    initials: "SJ",
    date: "2 days ago",
    fee: 1500,
    status: "active",
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Chen Enterprises",
    avatar: "/placeholder.svg",
    initials: "MC",
    date: "5 days ago",
    fee: 3200,
    status: "active",
  },
  {
    id: 3,
    name: "Amanda Rodriguez",
    company: "Rodriguez & Family",
    avatar: "/placeholder.svg",
    initials: "AR",
    date: "1 week ago",
    fee: 2800,
    status: "active",
  },
  {
    id: 4,
    name: "Robert Williams",
    company: "Williams Construction",
    avatar: "/placeholder.svg",
    initials: "RW",
    date: "2 weeks ago",
    fee: 1200,
    status: "inactive",
  },
];

export function RecentClients() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Recent Clients</CardTitle>
        <a href="/clients" className="text-sm text-primary hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-4">
          {recentClients.map((client) => (
            <div key={client.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={client.avatar} alt={client.name} />
                  <AvatarFallback>{client.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">${client.fee.toLocaleString()}</p>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
