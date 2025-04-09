
import React from "react";
import { Sidebar } from "./Sidebar";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-secondary border-0"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
