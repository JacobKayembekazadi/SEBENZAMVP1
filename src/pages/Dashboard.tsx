
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { RecentCases } from "@/components/dashboard/RecentCases";
import { BillingOverview } from "@/components/dashboard/BillingOverview";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CaseDistribution } from "@/components/dashboard/CaseDistribution";
import { 
  DollarSign, 
  Users, 
  FolderClosed, 
  Clock,
  CalendarClock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back, Jessica. Here's what's happening with your firm today."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Revenue"
          value="$129,583"
          icon={<DollarSign size={18} className="text-white" />}
          change={{ value: "12% vs last month", positive: true }}
          className="shadow rounded-lg overflow-hidden"
          iconClassName="bg-revenue text-white"
        />
        <StatCard
          title="Active Clients"
          value="48"
          icon={<Users size={18} className="text-white" />}
          change={{ value: "3 new this month", positive: true }}
          className="shadow rounded-lg overflow-hidden"
          iconClassName="bg-clients text-white"
        />
        <StatCard
          title="Active Cases"
          value="32"
          icon={<FolderClosed size={18} className="text-white" />}
          change={{ value: "5 cases added", positive: true }}
          className="shadow rounded-lg overflow-hidden"
          iconClassName="bg-cases text-white"
        />
        <StatCard
          title="Billable Hours"
          value="450"
          icon={<Clock size={18} className="text-white" />}
          change={{ value: "18% vs target", positive: false }}
          className="shadow rounded-lg overflow-hidden"
          iconClassName="bg-hours text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CalendarClock size={16} />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Prepare documents for Westfield case hearing
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarClock size={12} className="mr-1" />
                    Apr 10, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users size={12} className="mr-1" />
                    Michael Thompson
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Review contract for Brightline Technologies
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarClock size={12} className="mr-1" />
                    Apr 11, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users size={12} className="mr-1" />
                    Sarah Williams
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Client meeting with Oceanview Properties
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarClock size={12} className="mr-1" />
                    Apr 12, 2025
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users size={12} className="mr-1" />
                    Jessica Chen
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <RecentClients />
          <BillingOverview />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <RecentCases />
          <UpcomingEvents />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
