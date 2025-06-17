import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Search, Bell, Menu, User } from "lucide-react";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
        <div className="fixed left-0 top-0 h-full w-64 glass-sidebar">
          <Sidebar collapsed={false} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}>
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 glass-header flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-600 lg:hidden"
              >
                <Menu size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-600 hidden lg:flex"
              >
                <Menu size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 truncate">{title || "Dashboard"}</h1>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-full max-w-md hidden sm:block">
                <GlobalSearchBar />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent"></span>
              </Button>
              <div className="border-l border-gray-200 h-6 hidden sm:block"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 lg:space-x-3 focus:outline-none p-1 lg:p-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">Jessica Chen</span>
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400 hidden md:block">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-dropdown">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                {(title || description) && (
                  <div className="mb-6">
                    {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                  </div>
                )}
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}