import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  User,
  Filter,
  Tag,
  Star,
  TrendingUp
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientImport } from "@/components/clients/ClientImport";
import { useToast } from "@/hooks/use-toast";
import { useAppState, Client } from "@/lib/store";
import { ClientFilters } from "@/components/clients/ClientFilters";
// import { ClientRetentionAnalysis } from "@/components/clients/enhanced/ClientRetentionAnalysis";
// import { BulkEmailDialog } from "@/components/clients/communications/BulkEmailDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ClientFiltersState {
  categories: string[];
  tags: string[];
  priority: string[];
  status: string[];
  type: string[];
}

const Clients = () => {
  const { toast } = useToast();
  const { state, dispatch } = useAppState();
  const { clients: storeClients } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [showRetentionAnalysis, setShowRetentionAnalysis] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ClientFiltersState>({
    categories: [],
    tags: [],
    priority: [],
    status: [],
    type: [],
  });

  // Get unique categories and tags for filter options
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    storeClients.forEach(client => {
      client.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, [storeClients]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    storeClients.forEach(client => {
      client.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [storeClients]);

  // Apply filters and search
  const filteredClients = useMemo(() => {
    return storeClients.filter(client => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.company?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.some(cat => client.categories.includes(cat))) {
        return false;
      }

      // Tag filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => client.tags.includes(tag))) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(client.priority)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(client.status)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(client.type)) {
        return false;
      }

      return true;
    });
  }, [storeClients, searchTerm, filters]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'MMM d, yyyy');
    }
    return format(date, 'MMM d, yyyy');
  };

  const handleClientAdded = (clientData: any) => {
    const newClient: Client = {
      id: String(storeClients.length + 1),
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.companyName,
      type: clientData.type,
      status: 'active',
      createdAt: new Date(),
      categories: [],
      tags: [],
      priority: 'medium',
      relatedClients: [],
      notes: [],
      metrics: {
        totalBilling: 0,
        averageCaseValue: 0,
        clientSince: new Date(),
        paymentHistory: [],
      },
      communicationPreferences: {
        preferredMethod: 'email',
        doNotContact: false,
        language: 'English',
      },
      documents: [],
      activity: [],
    };

    dispatch({ type: 'ADD_CLIENT', payload: newClient });
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
  };

  const handleEditClient = (client: Client) => {
    toast({
      title: "Edit Client",
      description: `Opening edit form for ${client.firstName} ${client.lastName}`,
    });
  };

  const handleViewClient = (client: Client) => {
    window.location.href = `/clients/${client.id}`;
  };

  const handleContactClient = (client: Client, method: 'email' | 'phone') => {
    if (method === 'email' && client.email) {
      window.open(`mailto:${client.email}`, '_blank');
    } else if (method === 'phone' && client.phone) {
      window.open(`tel:${client.phone}`, '_blank');
    }
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Type', 'Status', 'Priority', 'Categories', 'Tags'];
    const csvData = storeClients.map(client => [
      client.firstName,
      client.lastName,
      client.email || '',
      client.phone || '',
      client.company || '',
      client.type,
      client.status,
      client.priority,
      client.categories.join('; '),
      client.tags.join('; ')
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

  const getPriorityIcon = (priority: Client['priority']) => {
    if (priority === 'high') return <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
    if (priority === 'medium') return <Star className="h-4 w-4 text-gray-400" />;
    return null;
  };

  return (
    <DashboardLayout title="Clients" description="Manage your client database and relationships">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search clients by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Clients</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ClientFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableCategories={availableCategories}
                  availableTags={availableTags}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={() => setShowRetentionAnalysis(true)}
            className="flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Retention Analysis
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkEmailDialog(true)}
            className="flex items-center gap-2"
            disabled={selectedClientIds.length === 0}
          >
            <Mail size={16} />
            Bulk Email {selectedClientIds.length > 0 && `(${selectedClientIds.length})`}
          </Button> */}
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
                <p className="text-2xl font-bold text-gray-900">{storeClients.length}</p>
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
                  {storeClients.filter(c => c.status === 'active').length}
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
                  {storeClients.filter(c => c.type === 'business').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {storeClients.filter(c => c.priority === 'high').length}
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClientIds.length === filteredClients.length && filteredClients.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClientIds(filteredClients.map(c => c.id));
                        } else {
                          setSelectedClientIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Categories & Tags</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClientIds.includes(client.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClientIds(prev => [...prev, client.id]);
                          } else {
                            setSelectedClientIds(prev => prev.filter(id => id !== client.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
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
                        {client.email && (
                          <div className="flex items-center text-sm">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            <a 
                              href={`mailto:${client.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {client.email}
                            </a>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            <a 
                              href={`tel:${client.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {client.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {client.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {client.categories.map(cat => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {client.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.type === 'business' ? 'default' : 'secondary'}>
                        {client.type === 'business' ? 'Business' : 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(client.priority)}
                        <span className="text-sm capitalize">{client.priority}</span>
                      </div>
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
                      {formatDate(client.createdAt)}
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
                          {client.email && (
                            <DropdownMenuItem onClick={() => handleContactClient(client, 'email')}>
                              <Mail size={16} className="mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          {client.phone && (
                            <DropdownMenuItem onClick={() => handleContactClient(client, 'phone')}>
                              <Phone size={16} className="mr-2" />
                              Call Client
                            </DropdownMenuItem>
                          )}
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

      {/* Bulk Email Dialog */}
      {/* <BulkEmailDialog
        open={showBulkEmailDialog}
        onOpenChange={setShowBulkEmailDialog}
        clients={storeClients}
        selectedClientIds={selectedClientIds}
      /> */}

      {/* Retention Analysis Dialog */}
      {/* <Dialog open={showRetentionAnalysis} onOpenChange={setShowRetentionAnalysis}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Client Retention Analysis</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <ClientRetentionAnalysis clients={storeClients} />
          </div>
        </DialogContent>
      </Dialog> */}
    </DashboardLayout>
  );
};

export default Clients;
