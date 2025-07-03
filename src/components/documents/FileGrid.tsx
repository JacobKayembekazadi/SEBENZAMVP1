import React from "react";
import { Clock, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FileIcon } from "./FileIcon";

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

interface FileGridProps {
  files: FileData[];
  onDelete?: (fileId: number) => void;
  onEdit?: (file: FileData) => void;
}

export const FileGrid = ({ files, onDelete, onEdit }: FileGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <FileIcon type={file.type} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Summarize with AI</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit && onEdit(file)}>
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete && onDelete(file.id)}>
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="font-medium mb-1 text-sm truncate">{file.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Clock size={12} className="mr-1" />
              <span>{file.modified}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{file.size}</Badge>
              <span className="text-xs text-muted-foreground">{file.case}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
