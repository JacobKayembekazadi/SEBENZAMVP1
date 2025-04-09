
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Filter, 
  Plus, 
  File, 
  FileImage, 
  FileAudio, 
  FilePdf as FileDocument, // Renamed since FilePdf doesn't exist
  Clock, 
  MoreVertical,
  ListFilter,
  Grid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const folders = [
  { id: 1, name: "Client Files", count: 24 },
  { id: 2, name: "Case Documents", count: 18 },
  { id: 3, name: "Templates", count: 7 },
  { id: 4, name: "Contracts", count: 12 },
  { id: 5, name: "Evidence", count: 5 },
];

const files = [
  { 
    id: 1, 
    name: "Smith Contract.pdf", 
    type: "pdf", 
    size: "2.4 MB", 
    modified: "Today, 2:30 PM", 
    client: "Smith & Co", 
    case: "Smith v. Jones",
    tags: ["contract", "confidential"]
  },
  { 
    id: 2, 
    name: "Case Brief.docx", 
    type: "document", 
    size: "843 KB", 
    modified: "Yesterday", 
    client: "Johnson LLC", 
    case: "Johnson v. State",
    tags: ["brief", "draft"]
  },
  { 
    id: 3, 
    name: "Evidence Photo.jpg", 
    type: "image", 
    size: "3.1 MB", 
    modified: "Jun 12, 2023", 
    client: "Williams Inc", 
    case: "Williams v. Davis",
    tags: ["evidence", "photo"]
  },
  { 
    id: 4, 
    name: "Witness Statement.mp3", 
    type: "audio", 
    size: "12.8 MB", 
    modified: "Jun 10, 2023", 
    client: "Davis Corp", 
    case: "Davis v. Miller",
    tags: ["interview", "confidential"]
  },
  { 
    id: 5, 
    name: "Client Agreement.pdf", 
    type: "pdf", 
    size: "1.2 MB", 
    modified: "Jun 8, 2023", 
    client: "Smith & Co", 
    case: "Smith v. Jones",
    tags: ["agreement", "signed"]
  },
];

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "pdf":
      return <FileDocument className="h-8 w-8 text-red-500" />; // Changed from FilePdf to FileDocument
    case "document":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "image":
      return <FileImage className="h-8 w-8 text-green-500" />;
    case "audio":
      return <FileAudio className="h-8 w-8 text-purple-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

const Documents = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  
  const filteredFiles = selectedFolder ? files.filter(file => file.id % 2 === selectedFolder % 2) : files;

  return (
    <DashboardLayout title="Documents">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
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
                  onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
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
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search documents..." 
                className="pl-9 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <ListFilter size={16} /> : <Grid size={16} />}
              </Button>
              <Button className="gap-2">
                <Plus size={16} />
                <span>Upload</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
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
                              <DropdownMenuItem className="text-red-600">
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
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-sm">Name</th>
                          <th className="text-left p-3 font-medium text-sm">Client</th>
                          <th className="text-left p-3 font-medium text-sm">Case</th>
                          <th className="text-left p-3 font-medium text-sm">Modified</th>
                          <th className="text-left p-3 font-medium text-sm">Size</th>
                          <th className="text-left p-3 font-medium text-sm w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="border-b hover:bg-muted/20">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FileIcon type={file.type} />
                                <span>{file.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm">{file.client}</td>
                            <td className="p-3 text-sm">{file.case}</td>
                            <td className="p-3 text-sm">{file.modified}</td>
                            <td className="p-3 text-sm">{file.size}</td>
                            <td className="p-3">
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
                                  <DropdownMenuItem className="text-red-600">
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
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
