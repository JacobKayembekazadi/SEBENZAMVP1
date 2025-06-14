import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { Client } from '@/lib/store';
import { format } from 'date-fns';

interface ClientTimelineProps {
  client: Client;
}

const activityIcons = {
  note: MessageSquare,
  call: Phone,
  meeting: Calendar,
  email: Mail,
  document: FileText,
  payment: DollarSign,
};

const activityColors = {
  note: 'bg-blue-100 text-blue-800',
  call: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800',
  email: 'bg-orange-100 text-orange-800',
  document: 'bg-gray-100 text-gray-800',
  payment: 'bg-emerald-100 text-emerald-800',
};

export function ClientTimeline({ client }: ClientTimelineProps) {
  // Sort activities by date (most recent first)
  const sortedActivities = [...client.activity].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {/* Timeline items */}
            <div className="space-y-6">
              {sortedActivities.map((activity, index) => {
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];
                
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={colorClass}>
                              {activity.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm">{activity.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{activity.user}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sortedActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 