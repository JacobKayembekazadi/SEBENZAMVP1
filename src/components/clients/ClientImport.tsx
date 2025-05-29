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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Invalid File",
          description: "CSV file must contain at least a header row and one data row.",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV (simple implementation - in production, use a proper CSV parser)
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: ImportedClient = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        row._originalRowIndex = (index + 2).toString(); // +2 because we start from line 2 (after header)
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(data);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      
      // Initialize field mappings with smart matching
      const mappings: FieldMapping[] = headers.map(csvHeader => {
        const lowerHeader = csvHeader.toLowerCase();
        let systemField = '';
        
        // Smart mapping based on common field names
        if (lowerHeader.includes('first') && lowerHeader.includes('name')) systemField = 'firstName';
        else if (lowerHeader.includes('last') && lowerHeader.includes('name')) systemField = 'lastName';
        else if (lowerHeader.includes('email')) systemField = 'email';
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
          sample: data[0]?.[csvHeader] || ''
        };
      });

      setFieldMappings(mappings);
      setStep('mapping');
      
      toast({
        title: "File Uploaded Successfully",
        description: `Loaded ${data.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error Reading File",
        description: "Failed to parse the CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const updateFieldMapping = (csvField: string, systemField: string) => {
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.csvField === csvField 
          ? { ...mapping, systemField }
          : mapping
      )
    );
  };

  const validateMappings = (): boolean => {
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required);
    const mappedRequiredFields = fieldMappings
      .filter(m => m.systemField && requiredFields.some(rf => rf.key === m.systemField))
      .map(m => m.systemField);

    const missingRequired = requiredFields.filter(rf => !mappedRequiredFields.includes(rf.key));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please map the following required fields: ${missingRequired.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const proceedToPreview = () => {
    if (!validateMappings()) return;
    setStep('preview');
  };

  const startImport = async () => {
    setStep('importing');
    setImportProgress(0);

    const results: ImportResults = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      // Simulate import process
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const originalRowIndex = parseInt(row._originalRowIndex || '0');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Validate required fields
          const mappedData: any = {};
          for (const mapping of fieldMappings) {
            if (mapping.systemField) {
              const value = row[mapping.csvField];
              if (mapping.required && !value?.trim()) {
                throw new Error(`Missing required field: ${SYSTEM_FIELDS.find(f => f.key === mapping.systemField)?.label}`);
              }
              mappedData[mapping.systemField] = value?.trim();
            }
          }

          // Additional validation
          if (mappedData.email && !/\S+@\S+\.\S+/.test(mappedData.email)) {
            throw new Error('Invalid email format');
          }

          if (mappedData.type && !['individual', 'business'].includes(mappedData.type.toLowerCase())) {
            mappedData.type = 'individual'; // Default fallback
          }

          if (mappedData.priority && !['low', 'medium', 'high'].includes(mappedData.priority.toLowerCase())) {
            mappedData.priority = 'medium'; // Default fallback
          }

          // Process tags
          if (mappedData.tags) {
            mappedData.tags = mappedData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          }

          // Here you would make the actual API call to create the client
          // await createClient(mappedData);
          
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: originalRowIndex,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        setImportProgress(((i + 1) / csvData.length) * 100);
      }

      setImportResults(results);
      setStep('complete');
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.successful} clients. ${results.failed} failed.`,
      });

      onImportComplete?.(results);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during the import process.",
        variant: "destructive",
      });
    }
  };

  const downloadSampleCSV = () => {
    const headers = SYSTEM_FIELDS.map(f => f.label).join(',');
    const sampleRow = [
      'John', 'Doe', 'john.doe@example.com', '555-0123', 'Acme Corp', 'business',
      '123 Main St', 'Anytown', 'CA', '90210', 'United States',
      '555-0124', 'Sample notes', 'Referral', 'high', 'corporate,new-client'
    ].join(',');
    
    const csv = `${headers}\n${sampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setImportProgress(0);
    setImportResults(null);
    setFileName('');
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        {step === 'upload' && (
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
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map CSV Fields to System Fields</CardTitle>
                <p className="text-sm text-gray-600">
                  Map your CSV columns to the corresponding fields in Sebenza. Required fields are marked with an asterisk (*).
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{mapping.csvField}</Label>
                        {mapping.sample && (
                          <p className="text-xs text-gray-500 mt-1">Sample: "{mapping.sample}"</p>
                        )}
                      </div>
                      <div className="w-8 text-center text-gray-400">→</div>
                      <div className="flex-1">
                        <Select 
                          value={mapping.systemField} 
                          onValueChange={(value) => updateFieldMapping(mapping.csvField, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Don't import this field</SelectItem>
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
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && (
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
        )}

        {step === 'importing' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Importing Clients...</h3>
                <p className="text-gray-500 mb-6">
                  Please wait while we import your client data. This may take a few moments.
                </p>
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round(importProgress)}% complete
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && importResults && (
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
                      {importResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle size={16} />
                          <AlertDescription>
                            Row {error.row}: {error.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {step === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          
          <div className="flex gap-2">
            {step === 'complete' && (
              <Button onClick={resetImport} variant="outline">
                Import Another File
              </Button>
            )}
            
            {step === 'mapping' && (
              <Button onClick={proceedToPreview}>
                Continue to Preview
              </Button>
            )}
            
            {step === 'preview' && (
              <Button onClick={startImport} className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Import ({csvData.length} records)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 