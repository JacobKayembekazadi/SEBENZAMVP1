
import React from "react";
import { FolderOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Folder {
  id: number;
  name: string;
  count: number;
}

interface FoldersListProps {
  folders: Folder[];
  selectedFolder: number | null;
  onSelectFolder: (folderId: number | null) => void;
}

export const FoldersList = ({ folders, selectedFolder, onSelectFolder }: FoldersListProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Folders</span>
          <Button variant="ghost" size="icon">
            <Plus size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id === selectedFolder ? null : folder.id)}
            className={`flex items-center justify-between w-full rounded-md p-2 text-sm hover:bg-secondary-light transition-colors ${
              selectedFolder === folder.id ? 'bg-secondary-light' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className={selectedFolder === folder.id ? 'text-accent' : 'text-primary'} />
              <span>{folder.name}</span>
            </div>
            <Badge variant="secondary">{folder.count}</Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
