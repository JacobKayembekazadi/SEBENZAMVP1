
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FinancialChart } from "./FinancialChart";

interface FinancialReportsProps {
  dateRange: "month" | "quarter" | "year";
}

export const FinancialReports = ({ dateRange }: FinancialReportsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Billed vs. Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Billed Amount</span>
                  <span className="text-muted-foreground">$82,500 / $120,000</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Collected Amount</span>
                  <span className="text-muted-foreground">$65,800 / $82,500</span>
                </div>
                <Progress value={79} className="h-2" />
              </div>
              <div className="flex flex-col mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Collection Rate</p>
                    <p className="text-lg font-bold">79.8%</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Aging</p>
                    <p className="text-lg font-bold">32 days</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="text-lg font-bold">$145,320</p>
                  <p className="text-xs text-success">↑ 8.2% from last {dateRange}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                  <p className="text-lg font-bold">$87,192</p>
                  <p className="text-xs text-destructive">↑ 5.4% from last {dateRange}</p>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                <p className="text-lg font-bold">$58,128</p>
                <p className="text-xs text-success">↑ 12.6% from last {dateRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">VAT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">VAT Collected</p>
                <p className="text-lg font-bold">$21,798</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">VAT Paid</p>
                <p className="text-lg font-bold">$13,078</p>
              </div>
              <div className="border rounded-md p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">VAT Due</p>
                <p className="text-lg font-bold">$8,720</p>
                <p className="text-xs">Due by: Apr 25, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <Tabs defaultValue="revenue">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium">Financial Trends</CardTitle>
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="profit">Profit</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <FinancialChart dateRange={dateRange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
