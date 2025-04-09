
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FileData {
  id: number;
  name: string;
  type: string;
  size: string;
  modified: string;
  client: string;
  case: string;
  tags: string[];
}

interface FiltersPanelProps {
  files: FileData[];
}

export const FiltersPanel = ({ files }: FiltersPanelProps) => {
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filter By</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Case</h4>
          <div className="space-y-1">
            {Array.from(new Set(files.map(file => file.case))).map((caseName, idx) => (
              <div key={idx} className="flex items-center">
                <input type="checkbox" id={`case-${idx}`} className="mr-2" />
                <label htmlFor={`case-${idx}`} className="text-sm">{caseName}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Client</h4>
          <div className="space-y-1">
            {Array.from(new Set(files.map(file => file.client))).map((client, idx) => (
              <div key={idx} className="flex items-center">
                <input type="checkbox" id={`client-${idx}`} className="mr-2" />
                <label htmlFor={`client-${idx}`} className="text-sm">{client}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(files.flatMap(file => file.tags))).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
