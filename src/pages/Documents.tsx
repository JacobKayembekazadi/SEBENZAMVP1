
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoldersList } from "@/components/documents/FoldersList";
import { FiltersPanel } from "@/components/documents/FiltersPanel";
import { SearchToolbar } from "@/components/documents/SearchToolbar";
import { FileGrid } from "@/components/documents/FileGrid";
import { FileList } from "@/components/documents/FileList";
import { folders, files } from "@/components/documents/data";

const Documents = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  
  const filteredFiles = selectedFolder 
    ? files.filter(file => file.id % 2 === selectedFolder % 2) 
    : files;

  return (
    <DashboardLayout title="Documents">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <FoldersList 
            folders={folders} 
            selectedFolder={selectedFolder} 
            onSelectFolder={setSelectedFolder} 
          />
          <FiltersPanel files={files} />
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <SearchToolbar 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {viewMode === "grid" 
                ? <FileGrid files={filteredFiles} /> 
                : <FileList files={filteredFiles} />
              }
            </TabsContent>
            <TabsContent value="recent">
              <div className="py-8 text-center text-muted-foreground">
                Recent files will appear here
              </div>
            </TabsContent>
            <TabsContent value="shared">
              <div className="py-8 text-center text-muted-foreground">
                Files shared with you will appear here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
