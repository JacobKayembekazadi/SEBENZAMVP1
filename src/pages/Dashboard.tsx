
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
  Clock
} from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Revenue"
          value="$129,583"
          icon={<DollarSign size={18} className="text-white" />}
          change={{ value: "12% vs last month", positive: true }}
          className="border-l-4 border-l-revenue"
          iconClassName="bg-revenue text-white"
        />
        <StatCard
          title="Active Clients"
          value="48"
          icon={<Users size={18} className="text-white" />}
          change={{ value: "3 new this month", positive: true }}
          className="border-l-4 border-l-clients"
          iconClassName="bg-clients text-white"
        />
        <StatCard
          title="Active Cases"
          value="32"
          icon={<FolderClosed size={18} className="text-white" />}
          change={{ value: "5 cases added", positive: true }}
          className="border-l-4 border-l-cases"
          iconClassName="bg-cases text-white"
        />
        <StatCard
          title="Billable Hours"
          value="450"
          icon={<Clock size={18} className="text-white" />}
          change={{ value: "18% vs target", positive: false }}
          className="border-l-4 border-l-hours"
          iconClassName="bg-hours text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <CaseDistribution />
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
