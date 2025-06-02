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
  HelpCircle,
  Package
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: number;
  collapsed?: boolean;
  dataTour?: string;
};

const SidebarItem = ({ icon: Icon, label, to, badge, collapsed, dataTour }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const itemContent = (
    <Link
      to={to}
      data-tour={dataTour}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
        "hover:bg-sidebar-hover hover:text-white group",
        isActive 
          ? "text-white bg-accent shadow-sm" 
          : "text-gray-300 hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      <div className={cn("flex items-center justify-center", collapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0")}>
        <Icon size={18} className={cn("transition-colors", isActive && "text-white")} />
      </div>
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge && (
            <span className="ml-auto bg-accent/20 text-accent text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  return collapsed ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {itemContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
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
  const { toast } = useToast();
  
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Logging out",
      description: "You would be logged out in a real application.",
    });
  };

  return (
    <div className="h-full bg-sidebar-DEFAULT flex flex-col border-r border-gray-800 overflow-hidden">
      {/* Header */}
      <div className={cn("p-4 border-b border-gray-800", collapsed && "p-2")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          {!collapsed && (
            <h1 className="text-2xl font-bold text-white tracking-tight">Sebenza</h1>
          )}
          {collapsed && (
            <div className="bg-accent p-2 rounded-lg">
              <span className="text-lg font-bold text-white">S</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-3 mt-6 p-3 bg-gray-800/50 rounded-lg">
            <Avatar className="h-9 w-9 border-2 border-accent/20">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="bg-accent text-white text-sm font-medium">JC</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">Jessica Chen</p>
              <p className="text-xs text-gray-400 truncate">Senior Partner</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className={cn("space-y-1", collapsed ? "px-2" : "px-4")}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" collapsed={collapsed} dataTour="dashboard" />
          <SidebarItem icon={Users} label="Clients" to="/clients" collapsed={collapsed} dataTour="cases" />
          <SidebarItem icon={FolderClosed} label="Cases" to="/cases" collapsed={collapsed} />
          <SidebarItem icon={Calendar} label="Calendar" to="/calendar" collapsed={collapsed} />
          <SidebarItem icon={FileText} label="Documents" to="/documents" collapsed={collapsed} dataTour="documents" />
          <SidebarItem icon={Receipt} label="Invoices" to="/invoices" collapsed={collapsed} dataTour="invoices" />
          <SidebarItem icon={Calculator} label="Estimates" to="/estimates" collapsed={collapsed} />
          <SidebarItem icon={Clock} label="Time Tracking" to="/time" collapsed={collapsed} dataTour="time-tracking" />
          <SidebarItem icon={CircleDollarSign} label="Expenses" to="/expenses" collapsed={collapsed} />
          <SidebarItem icon={Briefcase} label="Accounting" to="/accounting" collapsed={collapsed} dataTour="accounting" />
          <SidebarItem icon={MessageSquare} label="Messages" to="/messages" badge={3} collapsed={collapsed} />
          <SidebarItem icon={BarChart3} label="Reports" to="/reports" collapsed={collapsed} dataTour="reports" />
        </div>

        {/* Settings Section */}
        <div className={cn("mt-8 pt-4 border-t border-gray-800", collapsed ? "px-2" : "px-4")}>
          <div className="space-y-1">
            <SidebarItem icon={Package} label="My Package" to="/my-package" collapsed={collapsed} />
            <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} dataTour="settings" />
            <SidebarItem icon={HelpCircle} label="Help & Support" to="/help" collapsed={collapsed} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-gray-800", collapsed && "p-2")}>
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full text-sm rounded-lg font-medium transition-all duration-200",
            "text-gray-300 hover:bg-sidebar-hover hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}
