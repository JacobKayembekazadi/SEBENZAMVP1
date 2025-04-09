
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Davidson Estate Review",
    type: "Client Meeting",
    date: "Today",
    time: "2:00 PM - 3:30 PM",
    location: "Conference Room A",
  },
  {
    id: 2,
    title: "Smith v. Jones Pre-trial",
    type: "Court Appearance",
    date: "Tomorrow",
    time: "9:30 AM - 11:00 AM",
    location: "District Court",
  },
  {
    id: 3,
    title: "Legal Team Weekly",
    type: "Internal Meeting",
    date: "Apr 22, 2023",
    time: "10:00 AM - 11:00 AM",
    location: "Conference Room B",
  },
  {
    id: 4,
    title: "Rodriguez Contract Review",
    type: "Document Review",
    date: "Apr 23, 2023",
    time: "1:00 PM - 3:00 PM",
    location: "Office",
  },
];

export function UpcomingEvents() {
  const getIcon = (type: string) => {
    switch (type) {
      case "Client Meeting":
        return <Users size={14} />;
      case "Court Appearance":
        return <Calendar size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Upcoming Events</CardTitle>
        <a href="/calendar" className="text-sm text-primary hover:underline">
          View Calendar
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                {getIcon(event.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{event.type}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
