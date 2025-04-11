
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { CasePerformanceReport } from "@/components/reports/CasePerformanceReport";
import { StaffUtilizationReport } from "@/components/reports/StaffUtilizationReport";
import { ClientAnalyticsReport } from "@/components/reports/ClientAnalyticsReport";

const Reports = () => {
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month");
  
  return (
    <DashboardLayout title="Reports">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">Reports</h2>
          <p className="text-gray-500">
            Insights across legal, financial, and performance metrics
          </p>
        </div>
      </div>
      
      <ReportFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      <div className="mt-6">
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="mb-6 border border-gray-100 bg-gray-50 shadow-sm p-1 rounded-lg">
            <TabsTrigger value="financial" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Financial</TabsTrigger>
            <TabsTrigger value="case" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Case Performance</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Staff Utilization</TabsTrigger>
            <TabsTrigger value="clients" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Client Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial">
            <FinancialReports dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="case">
            <CasePerformanceReport dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="staff">
            <StaffUtilizationReport dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="clients">
            <ClientAnalyticsReport dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
