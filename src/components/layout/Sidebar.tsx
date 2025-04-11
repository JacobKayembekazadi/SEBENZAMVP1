
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Users, 
  FolderClosed, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock, 
  Settings, 
  LogOut,
  Receipt,
  Calculator,
  CircleDollarSign,
  BarChart3,
  Briefcase,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: number;
  collapsed?: boolean;
};

const SidebarItem = ({ icon: Icon, label, to, badge, collapsed }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const itemContent = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
        "hover:bg-sidebar-hover hover:text-white",
        isActive ? "text-white bg-sidebar-hover border-l-2 border-sidebar-active-border" : "text-gray-300"
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <Icon size={18} />
      </div>
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge && (
        <span className="ml-auto bg-accent/20 text-accent text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );

  return collapsed ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {itemContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    itemContent
  );
};

type SidebarProps = {
  collapsed?: boolean;
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <div className="bg-sidebar-DEFAULT h-screen flex flex-col border-r border-gray-800 overflow-y-auto fixed shadow-md">
      <div className={cn("p-4", collapsed ? "items-center" : "")}>
        <div className={cn("flex items-center gap-2 mb-8", collapsed && "justify-center")}>
          {!collapsed && <h1 className="text-2xl font-bold text-white">Sebenza</h1>}
          {collapsed && (
            <div className="bg-accent p-1 rounded">
              <span className="text-xl font-bold text-white">S</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-3 mb-8 px-2">
            <Avatar className="h-9 w-9 border-2 border-accent">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="bg-sidebar-hover text-white">JC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">Jessica Chen</p>
              <p className="text-xs text-gray-400">Senior Partner</p>
            </div>
          </div>
        )}
      </div>

      <div className={cn("mt-2 px-3 flex-1 space-y-1", collapsed && "px-2")}>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" collapsed={collapsed} />
        <SidebarItem icon={Users} label="Clients" to="/clients" collapsed={collapsed} />
        <SidebarItem icon={FolderClosed} label="Cases" to="/cases" collapsed={collapsed} />
        <SidebarItem icon={Calendar} label="Calendar" to="/calendar" collapsed={collapsed} />
        <SidebarItem icon={FileText} label="Documents" to="/documents" collapsed={collapsed} />
        <SidebarItem icon={Receipt} label="Invoices" to="/invoices" collapsed={collapsed} />
        <SidebarItem icon={Calculator} label="Estimates" to="/estimates" collapsed={collapsed} />
        <SidebarItem icon={Clock} label="Time Tracking" to="/time" collapsed={collapsed} />
        <SidebarItem icon={CircleDollarSign} label="Expenses" to="/expenses" collapsed={collapsed} />
        <SidebarItem icon={Briefcase} label="Accounting" to="/accounting" collapsed={collapsed} />
        <SidebarItem icon={MessageSquare} label="Messages" to="/messages" badge={3} collapsed={collapsed} />
        <SidebarItem icon={BarChart3} label="Reports" to="/reports" collapsed={collapsed} />
      </div>

      <div className="mt-8 px-3">
        <div className="mt-2 space-y-1">
          <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
          <SidebarItem icon={HelpCircle} label="Help & Support" to="/help" collapsed={collapsed} />
        </div>
      </div>

      <div className={cn("p-4 mt-auto border-t border-gray-800", collapsed && "p-2")}>
        <button className={cn(
          "flex items-center gap-3 px-3 py-2 w-full text-sm rounded-md font-medium transition-colors",
          "text-gray-300 hover:bg-sidebar-hover hover:text-white"
        )}>
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}
