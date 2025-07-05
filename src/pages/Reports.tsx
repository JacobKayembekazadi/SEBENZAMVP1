
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { CasePerformanceReport } from "@/components/reports/CasePerformanceReport";
import { StaffUtilizationReport } from "@/components/reports/StaffUtilizationReport";
import { ClientAnalyticsReport } from "@/components/reports/ClientAnalyticsReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  FileText, 
  Calendar,
  Clock,
  Archive,
  Copy,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// Interfaces
interface SavedReport {
  id: string;
  name: string;
  type: 'financial' | 'case' | 'staff' | 'client';
  category: string;
  description: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  parameters: {
    reportType: string;
    filters: Record<string, any>;
    format: 'summary' | 'detailed' | 'custom';
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    recipients: string[];
    nextRun?: Date;
  };
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
  status: 'draft' | 'active' | 'archived';
}

interface ReportTemplate {
  id: string;
  name: string;
  type: SavedReport['type'];
  category: string;
  description: string;
  defaultParameters: SavedReport['parameters'];
  isSystem: boolean;
}

// Mock Data
const mockSavedReports: SavedReport[] = [
  {
    id: '1',
    name: 'Monthly Financial Summary',
    type: 'financial',
    category: 'Financial',
    description: 'Comprehensive monthly financial overview including revenue, expenses, and profit margins',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    },
    parameters: {
      reportType: 'profit_loss',
      filters: { includeVAT: true, currency: 'ZAR' },
      format: 'detailed'
    },
    schedule: {
      enabled: true,
      frequency: 'monthly',
      recipients: ['finance@company.com', 'manager@company.com'],
      nextRun: new Date('2024-02-01')
    },
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-01'),
    lastGenerated: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Case Performance Analysis',
    type: 'case',
    category: 'Legal',
    description: 'Analysis of case performance metrics by practice area and individual cases',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-03-31')
    },
    parameters: {
      reportType: 'case_performance',
      filters: { practiceAreas: ['Corporate', 'Litigation'], includeArchived: false },
      format: 'summary'
    },
    createdBy: 'Jane Smith',
    createdAt: new Date('2024-01-05'),
    lastGenerated: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Staff Utilization Report',
    type: 'staff',
    category: 'HR',
    description: 'Staff utilization rates and productivity metrics across all departments',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    },
    parameters: {
      reportType: 'staff_utilization',
      filters: { departments: ['Legal', 'Finance'], includePartTime: true },
      format: 'detailed'
    },
    schedule: {
      enabled: true,
      frequency: 'weekly',
      recipients: ['hr@company.com'],
      nextRun: new Date('2024-01-28')
    },
    createdBy: 'Mike Johnson',
    createdAt: new Date('2024-01-10'),
    status: 'draft'
  },
  {
    id: '4',
    name: 'Client Analytics Dashboard',
    type: 'client',
    category: 'Business',
    description: 'Client acquisition, retention, and revenue analytics with trend analysis',
    dateRange: {
      from: new Date('2023-01-01'),
      to: new Date('2023-12-31')
    },
    parameters: {
      reportType: 'client_analytics',
      filters: { clientTypes: ['Corporate', 'Individual'], includeInactive: false },
      format: 'custom'
    },
    createdBy: 'Sarah Wilson',
    createdAt: new Date('2024-01-03'),
    lastGenerated: new Date('2024-01-18'),
    status: 'archived'
  }
];

const mockReportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Standard Financial Report',
    type: 'financial',
    category: 'Financial',
    description: 'Standard financial reporting template with P&L, balance sheet, and cash flow',
    defaultParameters: {
      reportType: 'financial_standard',
      filters: { includeVAT: true, currency: 'ZAR' },
      format: 'detailed'
    },
    isSystem: true
  },
  {
    id: '2',
    name: 'Case Performance Template',
    type: 'case',
    category: 'Legal',
    description: 'Template for case performance analysis with standard metrics',
    defaultParameters: {
      reportType: 'case_performance',
      filters: { practiceAreas: [], includeArchived: false },
      format: 'summary'
    },
    isSystem: true
  },
  {
    id: '3',
    name: 'Custom Client Report',
    type: 'client',
    category: 'Business',
    description: 'Custom client analytics template with configurable metrics',
    defaultParameters: {
      reportType: 'client_custom',
      filters: { clientTypes: [], includeInactive: false },
      format: 'custom'
    },
    isSystem: false
  }
];

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month");
  
  // State Management
  const [savedReports, setSavedReports] = useState<SavedReport[]>(mockSavedReports);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(mockReportTemplates);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [selectAllReports, setSelectAllReports] = useState(false);
  
  // Search, Filter, and Sort States
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportFilterType, setReportFilterType] = useState<'all' | 'financial' | 'case' | 'staff' | 'client'>('all');
  const [reportFilterStatus, setReportFilterStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [reportSortBy, setReportSortBy] = useState<'name' | 'type' | 'created' | 'lastGenerated'>('name');
  const [reportSortOrder, setReportSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog States
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReportDetailsDialog, setShowReportDetailsDialog] = useState(false);
  const [showReportScheduleDialog, setShowReportScheduleDialog] = useState(false);
  const [showReportTemplateDialog, setShowReportTemplateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null);
  
  // Form States
  const [reportForm, setReportForm] = useState<{
    name: string;
    type: SavedReport['type'];
    category: string;
    description: string;
    dateRange: {
      from: Date;
      to: Date;
    };
    parameters: {
      reportType: string;
      filters: Record<string, any>;
      format: 'summary' | 'detailed' | 'custom';
    };
    schedule: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
      recipients: string[];
    };
  }>({
    name: '',
    type: 'financial',
    category: '',
    description: '',
    dateRange: {
      from: new Date(),
      to: new Date()
    },
    parameters: {
      reportType: '',
      filters: {},
      format: 'summary'
    },
    schedule: {
      enabled: false,
      frequency: 'monthly',
      recipients: []
    }
  });

  // CRUD Handlers
  const handleSaveReport = () => {
    if (!reportForm.name || !reportForm.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newReport: SavedReport = {
      id: editingReport?.id || Date.now().toString(),
      name: reportForm.name,
      type: reportForm.type,
      category: reportForm.category,
      description: reportForm.description,
      dateRange: reportForm.dateRange,
      parameters: reportForm.parameters,
      schedule: reportForm.schedule.enabled ? reportForm.schedule : undefined,
      createdBy: 'Current User',
      createdAt: editingReport?.createdAt || new Date(),
      status: 'draft'
    };

    if (editingReport) {
      setSavedReports(savedReports.map(r => r.id === editingReport.id ? newReport : r));
      toast({
        title: "Success",
        description: "Report updated successfully!"
      });
    } else {
      setSavedReports([...savedReports, newReport]);
      toast({
        title: "Success",
        description: "Report created successfully!"
      });
    }

    setShowReportDialog(false);
    setEditingReport(null);
    resetReportForm();
  };

  const handleDeleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(r => r.id !== reportId));
    toast({
      title: "Success",
      description: "Report deleted successfully!"
    });
  };

  const handleGenerateReport = (report: SavedReport) => {
    const updatedReport = {
      ...report,
      lastGenerated: new Date()
    };
    setSavedReports(savedReports.map(r => r.id === report.id ? updatedReport : r));
    
    toast({
      title: "Success",
      description: `Report "${report.name}" generated successfully!`
    });
  };

  const handleViewReportDetails = (report: SavedReport) => {
    setSelectedReport(report);
    setShowReportDetailsDialog(true);
  };

  const handleEditReport = (report: SavedReport) => {
    setEditingReport(report);
    setReportForm({
      name: report.name,
      type: report.type,
      category: report.category,
      description: report.description,
      dateRange: report.dateRange,
      parameters: report.parameters,
      schedule: report.schedule || {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
    setShowReportDialog(true);
  };

  const handleDuplicateReport = (report: SavedReport) => {
    const duplicatedReport: SavedReport = {
      ...report,
      id: Date.now().toString(),
      name: `${report.name} (Copy)`,
      createdAt: new Date(),
      lastGenerated: undefined,
      status: 'draft'
    };
    setSavedReports([...savedReports, duplicatedReport]);
    toast({
      title: "Success",
      description: "Report duplicated successfully!"
    });
  };

  const handleArchiveReport = (reportId: string) => {
    setSavedReports(savedReports.map(r => 
      r.id === reportId ? { ...r, status: 'archived' as const } : r
    ));
    toast({
      title: "Success",
      description: "Report archived successfully!"
    });
  };

  const handleActivateReport = (reportId: string) => {
    setSavedReports(savedReports.map(r => 
      r.id === reportId ? { ...r, status: 'active' as const } : r
    ));
    toast({
      title: "Success",
      description: "Report activated successfully!"
    });
  };

  const handleBulkReportAction = (action: 'generate' | 'archive' | 'activate' | 'delete' | 'export', reportIds: string[]) => {
    const reports = savedReports.filter(r => reportIds.includes(r.id));
    
    switch (action) {
      case 'generate':
        const updatedReports = savedReports.map(r => 
          reportIds.includes(r.id) ? { ...r, lastGenerated: new Date() } : r
        );
        setSavedReports(updatedReports);
        break;
      case 'archive':
        setSavedReports(savedReports.map(r => 
          reportIds.includes(r.id) ? { ...r, status: 'archived' as const } : r
        ));
        break;
      case 'activate':
        setSavedReports(savedReports.map(r => 
          reportIds.includes(r.id) ? { ...r, status: 'active' as const } : r
        ));
        break;
      case 'delete':
        setSavedReports(savedReports.filter(r => !reportIds.includes(r.id)));
        break;
      case 'export':
        // Simulate export functionality
        const csvData = reports.map(r => ({
          Name: r.name,
          Type: r.type,
          Category: r.category,
          Status: r.status,
          Created: r.createdAt.toLocaleDateString(),
          LastGenerated: r.lastGenerated?.toLocaleDateString() || 'Never'
        }));
        console.log('Exporting reports:', csvData);
        break;
    }

    if (action === 'archive' || action === 'activate' || action === 'delete') {
      setSelectedReportIds([]);
      setSelectAllReports(false);

      toast({
        title: "Success",
        description: `${reportIds.length} reports ${action}d successfully!`
      });
    }
  };

  const handleExportReport = (report: SavedReport, format: 'pdf' | 'excel' | 'csv') => {
    // Simulate export functionality
    toast({
      title: "Success",
      description: `Report "${report.name}" exported as ${format.toUpperCase()}!`
    });
  };

  const resetReportForm = () => {
    setReportForm({
      name: '',
      type: 'financial',
      category: '',
      description: '',
      dateRange: {
        from: new Date(),
        to: new Date()
      },
      parameters: {
        reportType: '',
        filters: {},
        format: 'summary'
      },
      schedule: {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
  };

  const getFilteredReports = () => {
    return savedReports
      .filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                            report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                            report.category.toLowerCase().includes(reportSearchTerm.toLowerCase());
        const matchesType = reportFilterType === 'all' || report.type === reportFilterType;
        const matchesStatus = reportFilterStatus === 'all' || report.status === reportFilterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (reportSortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'created':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'lastGenerated':
            aValue = a.lastGenerated?.getTime() || 0;
            bValue = b.lastGenerated?.getTime() || 0;
            break;
          default:
            return 0;
        }
        
        if (reportSortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  };
  
  return (
    <DashboardLayout title="Reports">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">Reports</h2>
          <p className="text-gray-500">
            Insights across legal, financial, and performance metrics
          </p>
        </div>
      </div>
      
      <ReportFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
      
      <div className="mt-6">
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="mb-6 border border-gray-100 bg-gray-50 p-1 rounded-lg overflow-x-auto flex">
            <TabsTrigger value="financial" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Financial</TabsTrigger>
            <TabsTrigger value="case" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Case Performance</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Staff Utilization</TabsTrigger>
            <TabsTrigger value="clients" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Client Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial">
            <FinancialReports dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="case">
            <CasePerformanceReport dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="staff">
            <StaffUtilizationReport dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="clients">
            <ClientAnalyticsReport dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Saved Reports Management Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Saved Reports</CardTitle>
                <p className="text-sm text-gray-600">Manage your saved and scheduled reports</p>
              </div>
              <div className="flex gap-2">
                {selectedReportIds.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal size={16} className="mr-2" />
                        Actions ({selectedReportIds.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkReportAction('generate', selectedReportIds)}>
                        <FileText size={16} className="mr-2" />
                        Generate Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkReportAction('activate', selectedReportIds)}>
                        <CheckCircle size={16} className="mr-2" />
                        Activate Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkReportAction('archive', selectedReportIds)}>
                        <Archive size={16} className="mr-2" />
                        Archive Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkReportAction('export', selectedReportIds)}>
                        <Download size={16} className="mr-2" />
                        Export List
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${selectedReportIds.length} reports?`)) {
                            handleBulkReportAction('delete', selectedReportIds);
                          }
                        }}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Reports
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button onClick={() => setShowReportDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Enhanced Search, Filter & Sort Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search reports by name, description, or category..."
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={reportFilterType} onValueChange={(value) => setReportFilterType(value as typeof reportFilterType)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportFilterStatus} onValueChange={(value) => setReportFilterStatus(value as typeof reportFilterStatus)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportSortOrder(reportSortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown size={16} className="mr-2" />
                  {reportSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAllReports}
                      onCheckedChange={(checked) => {
                        setSelectAllReports(!!checked);
                        const filteredReports = getFilteredReports();
                        setSelectedReportIds(checked ? filteredReports.map(r => r.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => setReportSortBy('name')}>
                      Report Name
                      {reportSortBy === 'name' && <ArrowUpDown size={14} className="ml-2" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => setReportSortBy('type')}>
                      Type
                      {reportSortBy === 'type' && <ArrowUpDown size={14} className="ml-2" />}
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => setReportSortBy('lastGenerated')}>
                      Last Generated
                      {reportSortBy === 'lastGenerated' && <ArrowUpDown size={14} className="ml-2" />}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredReports().map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReportIds.includes(report.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReportIds([...selectedReportIds, report.id]);
                          } else {
                            setSelectedReportIds(selectedReportIds.filter(id => id !== report.id));
                            setSelectAllReports(false);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {report.dateRange.from.toLocaleDateString()} - {report.dateRange.to.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.schedule?.enabled ? (
                        <Badge className="bg-green-100 text-green-800">
                          {report.schedule.frequency}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report.lastGenerated ? report.lastGenerated.toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        report.status === 'active' ? 'bg-green-100 text-green-800' :
                        report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewReportDetails(report)}>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateReport(report)}>
                            <FileText size={14} className="mr-2" />
                            Generate Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditReport(report)}>
                            <Edit size={14} className="mr-2" />
                            Edit Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                            <Copy size={14} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {report.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleActivateReport(report.id)}>
                              <CheckCircle size={14} className="mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {report.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                              <Archive size={14} className="mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExportReport(report, 'pdf')}>
                            <Download size={14} className="mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReport(report, 'excel')}>
                            <Download size={14} className="mr-2" />
                            Export Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReport(report, 'csv')}>
                            <Download size={14} className="mr-2" />
                            Export CSV
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this report?')) {
                                handleDeleteReport(report.id);
                              }
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {getFilteredReports().length === 0 && (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  {reportSearchTerm || reportFilterType !== 'all' || reportFilterStatus !== 'all' 
                    ? 'No Reports Found' 
                    : 'No Reports Created'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {reportSearchTerm || reportFilterType !== 'all' || reportFilterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first report to get started with analytics and insights'
                  }
                </p>
                <Button onClick={() => setShowReportDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {/* Create/Edit Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Edit Report' : 'Create New Report'}
            </DialogTitle>
            <DialogDescription>
              {editingReport ? 'Update the report details below' : 'Configure your new report with the details below'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={reportForm.name}
                  onChange={(e) => setReportForm({...reportForm, name: e.target.value})}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="type">Report Type</Label>
                <Select value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value as SavedReport['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="case">Case Performance</SelectItem>
                    <SelectItem value="staff">Staff Utilization</SelectItem>
                    <SelectItem value="client">Client Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={reportForm.category}
                onChange={(e) => setReportForm({...reportForm, category: e.target.value})}
                placeholder="Enter category (e.g., Financial, Legal, HR)"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={reportForm.description}
                onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                placeholder="Describe what this report contains..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Report Format</Label>
                <Select value={reportForm.parameters.format} onValueChange={(value) => setReportForm({
                  ...reportForm, 
                  parameters: {...reportForm.parameters, format: value as 'summary' | 'detailed' | 'custom'}
                })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reportType">Report Subtype</Label>
                <Input
                  id="reportType"
                  value={reportForm.parameters.reportType}
                  onChange={(e) => setReportForm({
                    ...reportForm, 
                    parameters: {...reportForm.parameters, reportType: e.target.value}
                  })}
                  placeholder="e.g., profit_loss, case_analysis"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule-enabled"
                  checked={reportForm.schedule.enabled}
                  onCheckedChange={(checked) => setReportForm({
                    ...reportForm,
                    schedule: {...reportForm.schedule, enabled: checked}
                  })}
                />
                <Label htmlFor="schedule-enabled">Enable Automatic Scheduling</Label>
              </div>
              {reportForm.schedule.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={reportForm.schedule.frequency} onValueChange={(value) => setReportForm({
                      ...reportForm,
                      schedule: {...reportForm.schedule, frequency: value as typeof reportForm.schedule.frequency}
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipients">Email Recipients</Label>
                    <Input
                      id="recipients"
                      value={reportForm.schedule.recipients.join(', ')}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        schedule: {...reportForm.schedule, recipients: e.target.value.split(',').map(email => email.trim())}
                      })}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowReportDialog(false);
              setEditingReport(null);
              resetReportForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveReport}>
              {editingReport ? 'Update Report' : 'Create Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={showReportDetailsDialog} onOpenChange={setShowReportDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              Report Details: {selectedReport?.name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about this report
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">Report Name</Label>
                      <p className="font-medium">{selectedReport.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Type</Label>
                      <p>{selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Category</Label>
                      <p>{selectedReport.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <Badge className={
                        selectedReport.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedReport.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {selectedReport.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">Created By</Label>
                      <p>{selectedReport.createdBy}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Created Date</Label>
                      <p>{selectedReport.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Last Generated</Label>
                      <p>{selectedReport.lastGenerated?.toLocaleString() || 'Never'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Format</Label>
                      <p>{selectedReport.parameters.format.charAt(0).toUpperCase() + selectedReport.parameters.format.slice(1)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              {selectedReport.schedule && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock size={16} />
                      Schedule Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">Frequency</Label>
                      <p>{selectedReport.schedule.frequency.charAt(0).toUpperCase() + selectedReport.schedule.frequency.slice(1)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Recipients</Label>
                      <p>{selectedReport.schedule.recipients.join(', ')}</p>
                    </div>
                    {selectedReport.schedule.nextRun && (
                      <div>
                        <Label className="text-xs text-gray-500">Next Run</Label>
                        <p>{selectedReport.schedule.nextRun.toLocaleString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleEditReport(selectedReport)}>
                  <Edit size={16} className="mr-2" />
                  Edit Report
                </Button>
                <Button onClick={() => handleGenerateReport(selectedReport)}>
                  <FileText size={16} className="mr-2" />
                  Generate Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Reports;
