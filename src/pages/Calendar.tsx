import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, Users, MapPin } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const initialEvents = [
  {
    id: 1,
    title: "Davidson Estate Review",
    type: "Client Meeting",
    date: "2023-04-20",
    time: "2:00 PM - 3:30 PM",
    location: "Conference Room A",
    client: "Robert Davidson",
    description: "Review estate planning documents with client.",
  },
  {
    id: 2,
    title: "Smith v. Jones Pre-trial",
    type: "Court Appearance",
    date: "2023-04-21",
    time: "9:30 AM - 11:00 AM",
    location: "District Court",
    client: "Sarah Johnson",
    description: "Pre-trial hearing in the Smith v. Jones case.",
  },
  {
    id: 3,
    title: "Legal Team Weekly",
    type: "Internal Meeting",
    date: "2023-04-22",
    time: "10:00 AM - 11:00 AM",
    location: "Conference Room B",
    client: "",
    description: "Weekly team meeting to discuss ongoing cases.",
  },
  {
    id: 4,
    title: "Rodriguez Contract Review",
    type: "Document Review",
    date: "2023-04-23",
    time: "1:00 PM - 3:00 PM",
    location: "Office",
    client: "Amanda Rodriguez",
    description: "Review and finalize contract documents.",
  },
  {
    id: 5,
    title: "Harris IP Filing Deadline",
    type: "Deadline",
    date: "2023-04-25",
    time: "End of Day",
    location: "",
    client: "Jennifer Harris",
    description: "Filing deadline for patent application.",
  },
];

const CalendarPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [events, setEvents] = React.useState(initialEvents);
  const [showEventDialog, setShowEventDialog] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any>(null);

  // Filter events for the selected date
  const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
  const todayEvents = events.filter((event) => event.date === selectedDateStr);

  // Handler to open dialog for new event
  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventDialog(true);
  };

  // Handler to open dialog for editing
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventDialog(true);
  };

  // Handler to save event (add or update)
  const handleSaveEvent = (eventData: any) => {
    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...editingEvent, ...eventData } : ev));
      toast({ title: "Event Updated", description: `Event '${eventData.title}' updated.` });
    } else {
      const newEvent = { ...eventData, id: Date.now() };
      setEvents([newEvent, ...events]);
      toast({ title: "Event Added", description: `Event '${eventData.title}' added.` });
    }
    setShowEventDialog(false);
    setEditingEvent(null);
  };

  // Handler to delete event
  const handleDeleteEvent = (eventId: number) => {
    setEvents(events.filter(ev => ev.id !== eventId));
    toast({ title: "Event Deleted", description: "Event deleted successfully.", variant: "destructive" });
  };

  return (
    <DashboardLayout title="Calendar">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your meetings, court dates, and deadlines
          </p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus size={16} className="mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Tabs defaultValue="day">
            <div className="flex justify-between items-center p-4 border-b">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>Today</Button>
                <Button variant="ghost" size="icon">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            
            <TabsContent value="day" className="p-4">
              <h3 className="text-lg font-medium mb-4">{date?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <div className="space-y-4">
                {todayEvents.length === 0 && (
                  <div className="text-muted-foreground text-center">No events for this day.</div>
                )}
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex border rounded-md overflow-hidden relative group">
                    <div className="w-2 bg-primary"></div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            <span>{event.time}</span>
                            <MapPin size={14} className="ml-2" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Badge>{event.type}</Badge>
                      </div>
                      <p className="mt-2 text-sm">{event.description}</p>
                      {event.client && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Users size={14} className="text-muted-foreground" />
                          <span>Client: {event.client}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)} title="Edit Event">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)} title="Delete Event">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Week view will be implemented in the next phase.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="month">
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Month view will be implemented in the next phase.</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {events
                  .filter((event) => event.type === "Deadline")
                  .map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="bg-destructive/10 text-destructive p-2 rounded-md">
                        <CalendarIcon size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-title">Title</label>
              <Input id="event-title" defaultValue={editingEvent?.title || ''} placeholder="Event title..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-type">Type</label>
              <Input id="event-type" defaultValue={editingEvent?.type || ''} placeholder="Meeting, Deadline, etc." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-date">Date</label>
                <Input id="event-date" type="date" defaultValue={editingEvent?.date || selectedDateStr} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-time">Time</label>
                <Input id="event-time" defaultValue={editingEvent?.time || ''} placeholder="e.g. 2:00 PM - 3:00 PM" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-location">Location</label>
              <Input id="event-location" defaultValue={editingEvent?.location || ''} placeholder="Location..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-client">Client</label>
              <Input id="event-client" defaultValue={editingEvent?.client || ''} placeholder="Client name..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-description">Description</label>
              <Textarea id="event-description" defaultValue={editingEvent?.description || ''} placeholder="Event description..." rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const title = (document.getElementById('event-title') as HTMLInputElement)?.value;
                const type = (document.getElementById('event-type') as HTMLInputElement)?.value;
                const date = (document.getElementById('event-date') as HTMLInputElement)?.value;
                const time = (document.getElementById('event-time') as HTMLInputElement)?.value;
                const location = (document.getElementById('event-location') as HTMLInputElement)?.value;
                const client = (document.getElementById('event-client') as HTMLInputElement)?.value;
                const description = (document.getElementById('event-description') as HTMLTextAreaElement)?.value;
                handleSaveEvent({ title, type, date, time, location, client, description });
              }}>{editingEvent ? 'Update Event' : 'Add Event'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalendarPage;
