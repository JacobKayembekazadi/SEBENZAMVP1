
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Users, 
  FolderClosed, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock, 
  Settings, 
  LogOut
} from "lucide-react";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: number;
};

const SidebarItem = ({ icon: Icon, label, to, badge }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "sidebar-item",
        isActive && "sidebar-item-active"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
};

export function Sidebar() {
  return (
    <div className="bg-sidebar h-screen w-64 flex flex-col border-r border-sidebar-border overflow-y-auto fixed">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-1 rounded">
            <FileText size={18} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">LegalCRM</h1>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
            <p className="text-xs text-sidebar-foreground/70">Senior Partner</p>
          </div>
        </div>
      </div>

      <div className="mt-2 px-3 flex-1 space-y-1">
        <SidebarItem icon={BarChart3} label="Dashboard" to="/" />
        <SidebarItem icon={Users} label="Clients" to="/clients" />
        <SidebarItem icon={FolderClosed} label="Cases" to="/cases" />
        <SidebarItem icon={Calendar} label="Calendar" to="/calendar" />
        <SidebarItem icon={FileText} label="Documents" to="/documents" />
        <SidebarItem icon={MessageSquare} label="Messages" to="/messages" badge={3} />
        <SidebarItem icon={Clock} label="Time Tracking" to="/time" />

        <Separator className="my-4 bg-sidebar-border" />
        
        <SidebarItem icon={Settings} label="Settings" to="/settings" />
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <button className="sidebar-item w-full justify-start">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
