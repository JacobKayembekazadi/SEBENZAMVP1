import React from "react";
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FileIcon } from "./FileIcon";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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

interface FileListProps {
  files: FileData[];
  onDelete?: (fileId: number) => void;
  onEdit?: (file: FileData) => void;
}

export const FileList = ({ files, onDelete, onEdit }: FileListProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon type={file.type} />
                    <span>{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{file.client}</TableCell>
                <TableCell className="text-sm">{file.case}</TableCell>
                <TableCell className="text-sm">{file.modified}</TableCell>
                <TableCell className="text-sm">{file.size}</TableCell>
                <TableCell>
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
                      <DropdownMenuItem className="text-blue-600" onClick={() => onEdit && onEdit(file)}>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete && onDelete(file.id)}>
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
