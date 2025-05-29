import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Flag } from 'lucide-react';

interface GanttChartProps {
  tasks: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: string;
    priority: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    targetDate: string;
    status: string;
  }>;
}

export function GanttChart({ tasks, milestones }: GanttChartProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={18} />
          Case Timeline & Gantt Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Header */}
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 border-b pb-2">
          <div className="col-span-3">Task/Milestone</div>
          <div className="col-span-2">Start</div>
          <div className="col-span-2">End</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-3">Timeline</div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <Flag size={14} />
            Tasks
          </h4>
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-gray-50 rounded">
              <div className="col-span-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex gap-1">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-xs text-gray-600">
                {formatDate(task.startDate)}
              </div>
              <div className="col-span-2 text-xs text-gray-600">
                {formatDate(task.endDate)}
              </div>
              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{task.progress}%</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${getStatusColor(task.status)}`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="relative h-6 bg-gray-100 rounded">
                  <div 
                    className={`absolute h-full rounded ${getStatusColor(task.status)} opacity-70`}
                    style={{ 
                      left: '10%', 
                      width: '60%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <Target size={14} />
            Milestones
          </h4>
          {milestones.map((milestone) => (
            <div key={milestone.id} className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-gray-50 rounded">
              <div className="col-span-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{milestone.title}</p>
                  <Badge 
                    className={milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  >
                    {milestone.status}
                  </Badge>
                </div>
              </div>
              <div className="col-span-2 text-xs text-gray-600">
                {formatDate(milestone.targetDate)}
              </div>
              <div className="col-span-2 text-xs text-gray-600">
                Target Date
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-xs">{milestone.status}</span>
                </div>
              </div>
              <div className="col-span-3">
                <div className="relative h-6 bg-gray-100 rounded flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium mb-2">Legend</h5>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Delayed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 