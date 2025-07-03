import React from "react";
import { Search, Filter, Plus, ListFilter, Grid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchToolbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFilter?: () => void;
  onUpload?: () => void;
}

export const SearchToolbar = ({ viewMode, onViewModeChange, onFilter, onUpload }: SearchToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search documents..." 
          className="pl-9 bg-white"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" onClick={onFilter}>
          <Filter size={16} />
          <span>Filter</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? <ListFilter size={16} /> : <Grid size={16} />}
        </Button>
        <Button className="gap-2" onClick={onUpload}>
          <Plus size={16} />
          <span>Upload</span>
        </Button>
      </div>
    </div>
  );
};
