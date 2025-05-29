import React, { useState, useEffect } from 'react';
import { ClientPortalLogin } from '@/components/client-portal/ClientPortalLogin';
import { ClientPortalDashboard } from '@/components/client-portal/ClientPortalDashboard';

interface ClientData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  type: 'individual' | 'business';
  cases: Array<{ id: string; title: string; status: string }>;
  hasUnreadMessages: number;
  pendingInvoices: number;
  lastLogin: string;
}

const ClientPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing client authentication
    const token = localStorage.getItem('client_auth_token');
    const savedClientData = localStorage.getItem('client_data');
    
    if (token && savedClientData) {
      try {
        const parsed = JSON.parse(savedClientData);
        setClientData(parsed);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn('Failed to parse saved client data');
        // Clear invalid data
        localStorage.removeItem('client_auth_token');
        localStorage.removeItem('client_data');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (data: ClientData) => {
    setClientData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('client_auth_token');
    localStorage.removeItem('client_data');
    setClientData(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !clientData) {
    return <ClientPortalLogin onSuccess={handleLoginSuccess} />;
  }

  return <ClientPortalDashboard clientData={clientData} onLogout={handleLogout} />;
};

export default ClientPortal; 