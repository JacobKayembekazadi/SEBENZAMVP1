import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface ImportedClient {
  [key: string]: string;
}

interface FieldMapping {
  csvField: string;
  systemField: string;
  required: boolean;
  sample?: string;
}

interface ImportResults {
  successful: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

interface ClientImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (results: ImportResults) => void;
}

const SYSTEM_FIELDS = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'phone', label: 'Phone Number', required: true },
  { key: 'companyName', label: 'Company Name', required: false },
  { key: 'type', label: 'Client Type (individual/business)', required: false },
  { key: 'billingStreet', label: 'Billing Street Address', required: false },
  { key: 'billingCity', label: 'Billing City', required: false },
  { key: 'billingState', label: 'Billing State', required: false },
  { key: 'billingZip', label: 'Billing ZIP Code', required: false },
  { key: 'billingCountry', label: 'Billing Country', required: false },
  { key: 'alternatePhone', label: 'Alternate Phone', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'referralSource', label: 'Referral Source', required: false },
  { key: 'priority', label: 'Priority (low/medium/high)', required: false },
  { key: 'tags', label: 'Tags (comma-separated)', required: false }
];

export function ClientImport({ open, onOpenChange, onImportComplete }: ClientImportProps) {
  console.log('ClientImport rendered with:', { open });
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<ImportedClient[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState<ImportedClient[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  console.log('Current step:', step, 'File loaded:', fileLoaded, 'CSV data length:', csvData.length);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileUpload triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.log('Invalid file type:', file.name);
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast({
        title: "File Too Large",
        description: "Please upload a CSV file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    console.log('Starting CSV parsing...');

    try {
      // Use Papa Parse for proper CSV parsing
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim(),
        complete: (results) => {
          console.log('Papa Parse complete:', results);
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          const data = results.data as ImportedClient[];
          const headers = results.meta.fields || [];

          console.log('Parsed data:', data.length, 'rows');
          console.log('Headers:', headers);

          if (headers.length === 0 || data.length === 0) {
            console.log('Invalid file: no headers or data');
        toast({
          title: "Invalid File",
          description: "CSV file must contain at least a header row and one data row.",
          variant: "destructive",
        });
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

          // Add original row index for error tracking
          const dataWithRowIndex = data.map((row, index) => ({
            ...row,
            _originalRowIndex: (index + 2).toString() // +2 because we start from line 2 (after header)
          }));

          console.log('Setting data and mappings...');
      setCsvHeaders(headers);
          setCsvData(dataWithRowIndex);
          setTotalRows(dataWithRowIndex.length);
          setPreviewData(dataWithRowIndex.slice(0, 5));
      
      // Initialize field mappings with smart matching
      const mappings: FieldMapping[] = headers.map(csvHeader => {
        const lowerHeader = csvHeader.toLowerCase();
        let systemField = '';
        
        // Smart mapping based on common field names
        if (lowerHeader.includes('first') && lowerHeader.includes('name')) systemField = 'firstName';
        else if (lowerHeader.includes('last') && lowerHeader.includes('name')) systemField = 'lastName';
            else if (lowerHeader.includes('email') && !lowerHeader.includes('alt')) systemField = 'email';
        else if (lowerHeader.includes('phone') && !lowerHeader.includes('alt')) systemField = 'phone';
        else if (lowerHeader.includes('company')) systemField = 'companyName';
        else if (lowerHeader.includes('type')) systemField = 'type';
        else if (lowerHeader.includes('street') || (lowerHeader.includes('address') && lowerHeader.includes('1'))) systemField = 'billingStreet';
        else if (lowerHeader.includes('city')) systemField = 'billingCity';
        else if (lowerHeader.includes('state')) systemField = 'billingState';
        else if (lowerHeader.includes('zip') || lowerHeader.includes('postal')) systemField = 'billingZip';
        else if (lowerHeader.includes('country')) systemField = 'billingCountry';
        else if (lowerHeader.includes('alt') && lowerHeader.includes('phone')) systemField = 'alternatePhone';
        else if (lowerHeader.includes('note')) systemField = 'notes';
        else if (lowerHeader.includes('referral') || lowerHeader.includes('source')) systemField = 'referralSource';
        else if (lowerHeader.includes('priority')) systemField = 'priority';
        else if (lowerHeader.includes('tag')) systemField = 'tags';

        return {
          csvField: csvHeader,
          systemField,
          required: SYSTEM_FIELDS.find(f => f.key === systemField)?.required || false,
              sample: dataWithRowIndex[0]?.[csvHeader] || ''
        };
      });

          console.log('Field mappings created:', mappings);
      setFieldMappings(mappings);
      setFileLoaded(true);
      
      toast({
        title: "File Loaded Successfully",
            description: `Loaded ${dataWithRowIndex.length} records from ${file.name}`,
          });
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          toast({
            title: "Error Reading File",
            description: `Failed to parse the CSV file: ${error.message}`,
            variant: "destructive",
          });
          setFileName('');
          setFileLoaded(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      console.error('CSV parsing catch error:', error);
      toast({
        title: "Error Reading File",
        description: "Failed to read the CSV file. Please check the format.",
        variant: "destructive",
      });
      setFileName('');
      setFileLoaded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearFile = () => {
    setFileName('');
    setFileLoaded(false);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setPreviewData([]);
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const proceedToMapping = () => {
    console.log('proceedToMapping called', { 
      fileLoaded, 
      csvDataLength: csvData.length, 
      csvHeaders: csvHeaders.length,
      fieldMappings: fieldMappings.length 
    });
    
    if (!fileLoaded) {
      console.log('Cannot proceed to mapping - file not loaded');
      toast({
        title: "No File Loaded",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }
    
    if (csvData.length === 0) {
      console.log('Cannot proceed to mapping - no CSV data');
      toast({
        title: "No Data Found",
        description: "The CSV file appears to be empty or invalid.",
        variant: "destructive",
      });
      return;
    }
    
    if (csvHeaders.length === 0) {
      console.log('Cannot proceed to mapping - no CSV headers');
      toast({
        title: "No Headers Found",
        description: "The CSV file must have headers in the first row.",
        variant: "destructive",
      });
      return;
    }
    
    if (fieldMappings.length === 0) {
      console.log('No field mappings found, creating them...');
      // Recreate field mappings if they're missing
      const mappings: FieldMapping[] = csvHeaders.map(csvHeader => {
        const lowerHeader = csvHeader.toLowerCase();
        let systemField = '';
        
        // Smart mapping based on common field names
        if (lowerHeader.includes('first') && lowerHeader.includes('name')) systemField = 'firstName';
        else if (lowerHeader.includes('last') && lowerHeader.includes('name')) systemField = 'lastName';
        else if (lowerHeader.includes('email') && !lowerHeader.includes('alt')) systemField = 'email';
        else if (lowerHeader.includes('phone') && !lowerHeader.includes('alt')) systemField = 'phone';
        else if (lowerHeader.includes('company')) systemField = 'companyName';
        else if (lowerHeader.includes('type')) systemField = 'type';
        else if (lowerHeader.includes('street') || (lowerHeader.includes('address') && lowerHeader.includes('1'))) systemField = 'billingStreet';
        else if (lowerHeader.includes('city')) systemField = 'billingCity';
        else if (lowerHeader.includes('state')) systemField = 'billingState';
        else if (lowerHeader.includes('zip') || lowerHeader.includes('postal')) systemField = 'billingZip';
        else if (lowerHeader.includes('country')) systemField = 'billingCountry';
        else if (lowerHeader.includes('alt') && lowerHeader.includes('phone')) systemField = 'alternatePhone';
        else if (lowerHeader.includes('note')) systemField = 'notes';
        else if (lowerHeader.includes('referral') || lowerHeader.includes('source')) systemField = 'referralSource';
        else if (lowerHeader.includes('priority')) systemField = 'priority';
        else if (lowerHeader.includes('tag')) systemField = 'tags';

        return {
          csvField: csvHeader,
          systemField,
          required: SYSTEM_FIELDS.find(f => f.key === systemField)?.required || false,
          sample: csvData[0]?.[csvHeader] || ''
        };
      });
      
      setFieldMappings(mappings);
    }
    
    console.log('Proceeding to mapping step');
    setStep('mapping');
  };

  const updateFieldMapping = (csvField: string, systemField: string) => {
    console.log('Updating field mapping:', csvField, '->', systemField);
    // Convert 'none' back to empty string for internal storage
    const actualSystemField = systemField === 'none' ? '' : systemField;
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.csvField === csvField 
          ? { ...mapping, systemField: actualSystemField, required: SYSTEM_FIELDS.find(f => f.key === actualSystemField)?.required || false }
          : mapping
      )
    );
  };

  const validateMappings = (): boolean => {
    console.log('Validating mappings...');
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required);
    const mappedRequiredFields = fieldMappings
      .filter(m => m.systemField && requiredFields.some(rf => rf.key === m.systemField))
      .map(m => m.systemField);

    const missingRequired = requiredFields.filter(rf => !mappedRequiredFields.includes(rf.key));
    
    console.log('Required fields:', requiredFields.map(f => f.key));
    console.log('Mapped required fields:', mappedRequiredFields);
    console.log('Missing required fields:', missingRequired.map(f => f.key));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please map the following required fields: ${missingRequired.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicate mappings
    const duplicateMappings = fieldMappings
      .filter(m => m.systemField)
      .reduce((acc, mapping) => {
        if (acc[mapping.systemField]) {
          acc[mapping.systemField].push(mapping.csvField);
        } else {
          acc[mapping.systemField] = [mapping.csvField];
        }
        return acc;
      }, {} as Record<string, string[]>);

    const duplicates = Object.entries(duplicateMappings).filter(([_, fields]) => fields.length > 1);
    
    console.log('Duplicate mappings:', duplicates);
    
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Field Mappings",
        description: `Multiple CSV fields cannot map to the same system field: ${duplicates.map(([field, csvFields]) => `${field} (${csvFields.join(', ')})`).join('; ')}`,
        variant: "destructive",
      });
      return false;
    }

    console.log('Mappings validation passed');
    return true;
  };

  const proceedToPreview = () => {
    console.log('proceedToPreview called');
    if (!validateMappings()) return;
    console.log('Proceeding to preview step');
    setStep('preview');
  };

  const validateRowData = (mappedData: any, originalRowIndex: number): string[] => {
    const errors: string[] = [];

    // Validate email format
    if (mappedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mappedData.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone format (basic validation)
    if (mappedData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(mappedData.phone.replace(/\s/g, ''))) {
      errors.push('Invalid phone number format');
    }

    // Validate client type
    if (mappedData.type && !['individual', 'business'].includes(mappedData.type.toLowerCase())) {
      mappedData.type = 'individual'; // Default fallback
    }

    // Validate priority
    if (mappedData.priority && !['low', 'medium', 'high'].includes(mappedData.priority.toLowerCase())) {
      mappedData.priority = 'medium'; // Default fallback
    }

    return errors;
  };

  const startImport = async () => {
    console.log('startImport called', { csvDataLength: csvData.length });
    if (!csvData.length) {
      console.log('No data to import');
      toast({
        title: "No Data to Import",
        description: "Please upload and map CSV data first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting import process...');
    setStep('importing');
    setImportProgress(0);

    const results: ImportResults = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      // Process in smaller batches for better UX
      const batchSize = 10;
      const totalBatches = Math.ceil(csvData.length / batchSize);
      console.log(`Processing ${csvData.length} records in ${totalBatches} batches of ${batchSize}`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, csvData.length);
        const batch = csvData.slice(batchStart, batchEnd);

        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} records)`);

        for (let i = 0; i < batch.length; i++) {
          const row = batch[i];
        const originalRowIndex = parseInt(row._originalRowIndex || '0');
        
        try {
            // Map data according to field mappings
          const mappedData: any = {};
          for (const mapping of fieldMappings) {
            if (mapping.systemField) {
              const value = row[mapping.csvField];
              if (mapping.required && !value?.trim()) {
                throw new Error(`Missing required field: ${SYSTEM_FIELDS.find(f => f.key === mapping.systemField)?.label}`);
              }
                mappedData[mapping.systemField] = value?.trim() || '';
              }
            }

            // Validate row data
            const validationErrors = validateRowData(mappedData, originalRowIndex);
            if (validationErrors.length > 0) {
              throw new Error(validationErrors.join(', '));
          }

          // Process tags
          if (mappedData.tags) {
            mappedData.tags = mappedData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          }

          // Here you would make the actual API call to create the client
          // await createClient(mappedData);
            console.log(`Successfully processed row ${originalRowIndex}:`, mappedData);
          
          results.successful++;
        } catch (error) {
            console.error(`Error processing row ${originalRowIndex}:`, error);
          results.failed++;
          results.errors.push({
            row: originalRowIndex,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }

          // Update progress
          const currentIndex = batchStart + i + 1;
          setImportProgress((currentIndex / csvData.length) * 100);
        }

        // Small delay between batches to prevent UI blocking
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      console.log('Import complete. Results:', results);
      setImportResults(results);
      setStep('complete');
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.successful} clients. ${results.failed} failed.`,
      });

      onImportComplete?.(results);
    } catch (error) {
      console.error('Import process error:', error);
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during the import process.",
        variant: "destructive",
      });
      console.error('Import error:', error);
    }
  };

  const downloadSampleCSV = () => {
    const headers = SYSTEM_FIELDS.map(f => f.label);
    const sampleData = [
      ['John', 'Doe', 'john.doe@example.com', '(555) 123-4567', 'Acme Corp', 'business', '123 Main St', 'Anytown', 'CA', '90210', 'United States', '(555) 123-4568', 'Sample notes', 'Website', 'high', 'corporate,new-client'],
      ['Jane', 'Smith', 'jane.smith@example.com', '(555) 987-6543', '', 'individual', '456 Oak Ave', 'Springfield', 'NY', '12345', 'United States', '', 'Individual client', 'Referral', 'medium', 'individual,personal']
    ];
    
    const csvContent = Papa.unparse({
      fields: headers,
      data: sampleData
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    console.log('resetImport called');
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setImportProgress(0);
    setImportResults(null);
    setFileName('');
    setPreviewData([]);
    setFileLoaded(false);
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('Import state reset complete');
  };

  // Add effect to track when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      console.log('Import dialog opened');
      // Reset state when dialog opens
      resetImport();
    } else {
      console.log('Import dialog closed');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet size={20} />
            Import Clients from CSV
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {['upload', 'mapping', 'preview', 'importing', 'complete'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-blue-600 text-white' 
                    : ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > index ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium capitalize">{stepName}</span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {(() => {
            try {
              switch (step) {
                case 'upload':
                  return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={18} />
                  Upload CSV File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Choose a CSV file to import</h3>
                  <p className="text-gray-500 mb-4">
                    Upload a CSV file containing client information. The file should include headers in the first row.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Select CSV File
                  </Button>
                            
                            {/* Debug button for testing */}
                            <Button
                              onClick={() => {
                                console.log('Debug button clicked');
                                console.log('Current state:', { step, fileLoaded, csvData: csvData.length, fileName });
                                // Simulate file loaded for testing
                                if (!fileLoaded) {
                                  console.log('Simulating file load for testing...');
                                  setCsvData([{ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '555-0123', _originalRowIndex: '2' }]);
                                  setCsvHeaders(['firstName', 'lastName', 'email', 'phone']);
                                  setFieldMappings([
                                    { csvField: 'firstName', systemField: 'firstName', required: true, sample: 'Test' },
                                    { csvField: 'lastName', systemField: 'lastName', required: true, sample: 'User' },
                                    { csvField: 'email', systemField: 'email', required: true, sample: 'test@example.com' },
                                    { csvField: 'phone', systemField: 'phone', required: true, sample: '555-0123' }
                                  ]);
                                  setFileName('test.csv');
                                  setFileLoaded(true);
                                  setTotalRows(1);
                                  setPreviewData([{ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '555-0123', _originalRowIndex: '2' }]);
                                  toast({
                                    title: "Test Data Loaded",
                                    description: "Loaded test data for debugging",
                                  });
                                }
                              }}
                              variant="outline"
                              className="ml-4"
                            >
                              Debug: Load Test Data
                            </Button>
                  
                  {fileName && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                        <FileSpreadsheet size={20} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{fileName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFile}
                          className="p-1 h-auto"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {fileLoaded && csvData.length > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      {csvData.length} records ready to import
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Sample CSV
                  </Button>
                  <p className="text-sm text-gray-500">
                    Need help? Download a sample CSV with the correct format.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
                  );

                case 'mapping':
                  return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map CSV Fields to System Fields</CardTitle>
                <p className="text-sm text-gray-600">
                  Map your CSV columns to the corresponding fields in Sebenza. Required fields are marked with an asterisk (*).
                </p>
              </CardHeader>
              <CardContent>
                          {fieldMappings && fieldMappings.length > 0 ? (
                <div className="space-y-4">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                                    <Label className="text-sm font-medium">{mapping.csvField || 'Unknown Field'}</Label>
                        {mapping.sample && (
                          <p className="text-xs text-gray-500 mt-1">Sample: "{mapping.sample}"</p>
                        )}
                      </div>
                      <div className="w-8 text-center text-gray-400">→</div>
                      <div className="w-64">
                        <Select 
                                      value={mapping.systemField || 'none'} 
                                      onValueChange={(value) => updateFieldMapping(mapping.csvField, value === 'none' ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                                        <SelectItem value="none">Don't import this field</SelectItem>
                            {SYSTEM_FIELDS.map(field => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label} {field.required && '*'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">No CSV fields found to map. Please go back and upload a valid CSV file.</p>
                              <Button 
                                onClick={() => setStep('upload')} 
                                variant="outline"
                                className="mt-4"
                              >
                                Back to Upload
                              </Button>
                            </div>
                          )}
              </CardContent>
            </Card>
          </div>
                  );

                case 'preview':
                  return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={18} />
                  Preview Import Data
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Review the first few rows to ensure the mapping is correct. {csvData.length} total records will be imported.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {fieldMappings
                          .filter(m => m.systemField)
                          .map(mapping => (
                            <TableHead key={mapping.systemField}>
                              {SYSTEM_FIELDS.find(f => f.key === mapping.systemField)?.label}
                              {SYSTEM_FIELDS.find(f => f.key === mapping.systemField)?.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {fieldMappings
                            .filter(m => m.systemField)
                            .map(mapping => (
                              <TableCell key={mapping.systemField}>
                                {row[mapping.csvField] || (
                                  <span className="text-gray-400 italic">empty</span>
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
                  );

                case 'importing':
                  return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Importing Clients...</h3>
                <p className="text-gray-500 mb-6">
                            Please wait while we import your client data. Processing {totalRows} records...
                </p>
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">
                            {Math.round(importProgress)}% complete ({Math.round((importProgress / 100) * totalRows)} of {totalRows} records)
                </p>
              </CardContent>
            </Card>
          </div>
                  );

                case 'complete':
                  return importResults ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                    <div className="text-sm text-green-700">Successfully Imported</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Import Errors:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                                {importResults.errors.slice(0, 10).map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle size={16} />
                          <AlertDescription>
                            Row {error.row}: {error.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                                {importResults.errors.length > 10 && (
                                  <p className="text-sm text-gray-500 text-center">
                                    ... and {importResults.errors.length - 10} more errors
                                  </p>
                                )}
                    </div>
                  </div>
                )}

                          {importResults.successful > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Review the imported clients in your client list</li>
                                <li>• Update any missing information</li>
                                <li>• Create cases for new clients if needed</li>
                              </ul>
                            </div>
                          )}
              </CardContent>
            </Card>
          </div>
                  ) : null;

                default:
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Unknown step: {step}</p>
                      <Button onClick={() => setStep('upload')} variant="outline" className="mt-4">
                        Back to Upload
                      </Button>
                    </div>
                  );
              }
            } catch (error) {
              console.error('Error rendering step:', step, error);
              return (
                <div className="text-center py-8">
                  <Alert variant="destructive">
                    <AlertCircle size={16} />
                    <AlertDescription>
                      An error occurred while rendering this step. Please try refreshing or going back to upload.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => setStep('upload')} variant="outline" className="mt-4">
                    Back to Upload
                  </Button>
                </div>
              );
            }
          })()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            {step !== 'upload' && step !== 'importing' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'mapping') setStep('upload');
                  else if (step === 'preview') setStep('mapping');
                  else if (step === 'complete') setStep('preview');
                }}
              >
                Back
              </Button>
            )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {step === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          </div>
          
          <div className="flex gap-2">
            {step === 'upload' && (
              <Button 
                onClick={proceedToMapping} 
                disabled={!fileLoaded || csvData.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next: Map Fields
              </Button>
            )}
            
            {step === 'mapping' && (
              <Button 
                onClick={proceedToPreview}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next: Preview Data
              </Button>
            )}
            
            {step === 'preview' && (
              <Button 
                onClick={startImport} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Import ({csvData.length} records)
              </Button>
            )}

            {step === 'complete' && (
              <Button 
                onClick={resetImport} 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Import Another File
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 