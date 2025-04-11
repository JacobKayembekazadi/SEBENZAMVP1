
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
          <h2 className="text-2xl font-bold mb-1">Reports</h2>
          <p className="text-muted-foreground">
            Insights across legal, financial, and performance metrics
          </p>
        </div>
      </div>
      
      <ReportFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      <div className="mt-6">
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="case">Case Performance</TabsTrigger>
            <TabsTrigger value="staff">Staff Utilization</TabsTrigger>
            <TabsTrigger value="clients">Client Analytics</TabsTrigger>
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
