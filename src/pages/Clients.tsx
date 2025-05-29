import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Mail,
  Phone,
  Building,
  User
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientImport } from "@/components/clients/ClientImport";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  totalCases: number;
  lastContact: string;
  avatar?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    company: 'Acme Corporation',
    type: 'business',
    status: 'active',
    totalCases: 3,
    lastContact: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@personal.com',
    phone: '(555) 987-6543',
    type: 'individual',
    status: 'active',
    totalCases: 1,
    lastContact: '2024-01-10',
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@techstartup.com',
    phone: '(555) 456-7890',
    company: 'Tech Startup Inc.',
    type: 'business',
    status: 'active',
    totalCases: 2,
    lastContact: '2024-01-08',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '(555) 321-0987',
    type: 'individual',
    status: 'inactive',
    totalCases: 1,
    lastContact: '2023-12-20',
  }
];

const Clients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClientAdded = (clientData: any) => {
    // In a real app, this would make an API call
    const newClient: Client = {
      id: String(clients.length + 1),
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.companyName,
      type: clientData.type,
      status: 'active',
      totalCases: 0,
      lastContact: new Date().toISOString().split('T')[0],
    };

    setClients(prev => [...prev, newClient]);
    toast({
      title: "Client Added",
      description: `${clientData.firstName} ${clientData.lastName} has been added successfully.`,
    });
  };

  const handleImportComplete = (results: any) => {
    toast({
      title: "Import Complete",
      description: `Successfully imported ${results.successful} clients.`,
    });
    // In a real app, you would refresh the clients list from the API
  };

  const handleEditClient = (client: Client) => {
    toast({
      title: "Edit Client",
      description: `Opening edit form for ${client.firstName} ${client.lastName}`,
    });
    // In a real app, this would open an edit dialog
  };

  const handleViewClient = (client: Client) => {
    toast({
      title: "View Client",
      description: `Opening detailed view for ${client.firstName} ${client.lastName}`,
    });
    // In a real app, this would navigate to client details page
  };

  const handleContactClient = (client: Client, method: 'email' | 'phone') => {
    if (method === 'email') {
      window.open(`mailto:${client.email}`, '_blank');
    } else {
      window.open(`tel:${client.phone}`, '_blank');
    }
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Type', 'Status', 'Total Cases', 'Last Contact'];
    const csvData = clients.map(client => [
      client.firstName,
      client.lastName,
      client.email,
      client.phone,
      client.company || '',
      client.type,
      client.status,
      client.totalCases,
      client.lastContact
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-export.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Client data has been exported to CSV.",
    });
  };

  return (
    <DashboardLayout title="Clients" description="Manage your client database and relationships">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search clients by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            data-tour="add-client"
          >
            <Plus size={16} />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Business Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.type === 'business').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Individual Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.type === 'individual').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cases</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={client.avatar} alt={`${client.firstName} ${client.lastName}`} />
                          <AvatarFallback>{getInitials(client.firstName, client.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.company && (
                            <div className="text-sm text-gray-500">{client.company}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          <a 
                            href={`mailto:${client.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {client.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          <a 
                            href={`tel:${client.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.type === 'business' ? 'default' : 'secondary'}>
                        {client.type === 'business' ? 'Business' : 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{client.totalCases}</span>
                      <span className="text-sm text-gray-500 ml-1">cases</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                        className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(client.lastContact)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClient(client)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit size={16} className="mr-2" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactClient(client, 'email')}>
                            <Mail size={16} className="mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactClient(client, 'phone')}>
                            <Phone size={16} className="mr-2" />
                            Call Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No clients found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onClientAdded={handleClientAdded}
      />

      <ClientImport
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
};

export default Clients;
