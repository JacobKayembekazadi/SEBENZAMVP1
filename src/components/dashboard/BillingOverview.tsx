
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BillingOverview() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Billing Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">Outstanding Invoices</span>
              <span className="text-muted-foreground">$32,500 / $45,000</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">Billable Hours</span>
              <span className="text-muted-foreground">115 / 160 hrs</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">Completed Cases</span>
              <span className="text-muted-foreground">14 / 22</span>
            </div>
            <Progress value={63} className="h-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
            <p className="text-lg font-bold">$48,500</p>
            <p className="text-xs text-success mt-1">↑ 12% from last month</p>
          </div>
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Average Case Value</p>
            <p className="text-lg font-bold">$3,450</p>
            <p className="text-xs text-success mt-1">↑ 5% from last month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
