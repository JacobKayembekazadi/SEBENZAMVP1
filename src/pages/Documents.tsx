import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoldersList } from "@/components/documents/FoldersList";
import { FiltersPanel } from "@/components/documents/FiltersPanel";
import { SearchToolbar } from "@/components/documents/SearchToolbar";
import { FileGrid } from "@/components/documents/FileGrid";
import { FileList } from "@/components/documents/FileList";
import { folders as initialFolders, files as initialFiles } from "@/components/documents/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const Documents = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [files, setFiles] = useState(initialFiles);
  const [folders, setFolders] = useState(initialFolders);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);

  // CRUD handlers for files
  const handleDeleteFile = (fileId: number) => {
    setFiles(files.filter(f => f.id !== fileId));
  };
  const handleEditFile = (fileId: number, newData: any) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, ...newData } : f));
  };
  const handleAddFile = (file: any) => {
    setFiles([{ ...file, id: Date.now() }, ...files]);
  };

  const handleRequestEditFile = (file: any) => {
    setEditingFile(file);
    setShowFileDialog(true);
  };

  const handleSaveFile = (fileData: any) => {
    if (editingFile) {
      setFiles(files.map(f => f.id === editingFile.id ? { ...editingFile, ...fileData } : f));
      toast({ title: "File Updated", description: `File '${fileData.name}' has been updated.` });
    } else {
      const newFile = { ...fileData, id: Date.now(), type: "pdf", size: "--", modified: "Just now", tags: [] };
      setFiles([newFile, ...files]);
      toast({ title: "File Added", description: `File '${fileData.name}' has been added.` });
    }
    setShowFileDialog(false);
    setEditingFile(null);
  };

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
            onFilter={() => setShowFiltersDialog(true)}
            onUpload={() => { setEditingFile(null); setShowFileDialog(true); }}
          />
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {viewMode === "grid" 
                ? <FileGrid files={filteredFiles} onDelete={handleDeleteFile} onEdit={handleRequestEditFile} /> 
                : <FileList files={filteredFiles} onDelete={handleDeleteFile} onEdit={handleRequestEditFile} />
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

      {/* File Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFile ? "Edit File" : "Add File"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="file-name" className="block text-sm font-medium mb-1">File Name</label>
              <Input id="file-name" defaultValue={editingFile?.name || ""} placeholder="e.g. Contract.pdf" />
            </div>
            <div>
              <label htmlFor="file-client" className="block text-sm font-medium mb-1">Client</label>
              <Input id="file-client" defaultValue={editingFile?.client || ""} placeholder="Client name" />
            </div>
            <div>
              <label htmlFor="file-case" className="block text-sm font-medium mb-1">Case</label>
              <Input id="file-case" defaultValue={editingFile?.case || ""} placeholder="Case name" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFileDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const name = (document.getElementById('file-name') as HTMLInputElement)?.value;
                const client = (document.getElementById('file-client') as HTMLInputElement)?.value;
                const caseName = (document.getElementById('file-case') as HTMLInputElement)?.value;
                handleSaveFile({ name, client, case: caseName });
              }}>{editingFile ? "Save Changes" : "Add File"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog for small screens */}
      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Files</DialogTitle>
          </DialogHeader>
          <FiltersPanel files={files} />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Documents;
