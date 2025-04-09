
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
  LogOut,
  LayoutDashboard,
  Receipt,
  PieChart,
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
        "flex items-center gap-3 px-4 py-2.5 text-sm rounded-md font-medium transition-colors",
        "hover:bg-sidebar-hover hover:text-accent",
        isActive ? "border-l-2 border-accent text-accent pl-[15px]" : "border-l-2 border-transparent pl-[15px]"
      )}
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge && (
        <span className="ml-auto bg-warning text-warning-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
    <div className="bg-sidebar text-sidebar-foreground h-screen flex flex-col border-r border-sidebar-border overflow-y-auto fixed">
      <div className={cn("p-4", collapsed ? "items-center" : "")}>
        <div className={cn("flex items-center gap-2 mb-6", collapsed && "justify-center")}>
          <div className="bg-accent p-1 rounded">
            <FileText size={18} className="text-accent-foreground" />
          </div>
          {!collapsed && <h1 className="text-xl font-bold text-sidebar-foreground">LegalCRM</h1>}
        </div>

        {!collapsed && (
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
        )}
      </div>

      <div className={cn("mt-2 px-3 flex-1 space-y-1", collapsed && "px-2")}>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" collapsed={collapsed} />
        <SidebarItem icon={Users} label="Clients" to="/clients" collapsed={collapsed} />
        <SidebarItem icon={FolderClosed} label="Cases" to="/cases" collapsed={collapsed} />
        <SidebarItem icon={Calendar} label="Calendar" to="/calendar" collapsed={collapsed} />
        <SidebarItem icon={FileText} label="Documents" to="/documents" collapsed={collapsed} />
        <SidebarItem icon={Receipt} label="Invoices" to="/invoices" collapsed={collapsed} />
        <SidebarItem icon={Clock} label="Time Tracking" to="/time" collapsed={collapsed} />
        <SidebarItem icon={MessageSquare} label="Messages" to="/messages" badge={3} collapsed={collapsed} />
        <SidebarItem icon={PieChart} label="Reports" to="/reports" collapsed={collapsed} />

        <Separator className="my-4 bg-sidebar-border" />
        
        <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
        <SidebarItem icon={HelpCircle} label="Help & Support" to="/help" collapsed={collapsed} />
      </div>

      <div className={cn("p-4 mt-auto border-t border-sidebar-border", collapsed && "p-2")}>
        <button className={cn(
          "flex items-center gap-3 px-4 py-2.5 w-full text-sm rounded-md font-medium transition-colors",
          "hover:bg-sidebar-hover hover:text-accent"
        )}>
          <LogOut size={20} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}
