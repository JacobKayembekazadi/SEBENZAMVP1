
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, RefreshCw } from "lucide-react";

interface ReportFiltersProps {
  dateRange: "month" | "quarter" | "year";
  onDateRangeChange: (value: "month" | "quarter" | "year") => void;
}

export const ReportFilters = ({ dateRange, onDateRangeChange }: ReportFiltersProps) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Date Range</label>
              <Select 
                value={dateRange} 
                onValueChange={(value) => onDateRangeChange(value as "month" | "quarter" | "year")}
              >
                <SelectTrigger className="w-[180px] border border-gray-200 bg-white">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Report Type</label>
              <Select defaultValue="detailed">
                <SelectTrigger className="w-[180px] border border-gray-200 bg-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 self-end">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
