
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Help = () => {
  return (
    <DashboardLayout title="Help & Support" description="Get help with using the system or contact support">
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">How to navigate the system</h3>
                  <p className="text-sm text-gray-600">Learn about the key areas of the application and how to efficiently navigate between them.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Setting up your account</h3>
                  <p className="text-sm text-gray-600">Complete your profile, add your profile picture, and set your preferences.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Understanding the dashboard</h3>
                  <p className="text-sm text-gray-600">Learn about the various metrics and data displayed on your dashboard.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Managing user access and permissions</h3>
                  <p className="text-sm text-gray-600">Set up access levels for different team members and control what they can view or edit.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">How do I reset my password?</h3>
                  <p className="text-sm text-gray-600">Steps to reset your password if you've forgotten it or need to change it for security reasons.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Can I customize the dashboard view?</h3>
                  <p className="text-sm text-gray-600">Learn how to rearrange and customize the widgets on your dashboard.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">How do I export data from the system?</h3>
                  <p className="text-sm text-gray-600">Guide to exporting reports, client data, and other information from the system.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Creating a new case</h3>
                  <p className="text-sm text-gray-600">Step-by-step guide to creating a new case and setting up all required information.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Assigning team members to cases</h3>
                  <p className="text-sm text-gray-600">How to assign attorneys, paralegals, and other staff to specific case roles.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Setting up case deadlines and reminders</h3>
                  <p className="text-sm text-gray-600">Managing important dates, statute of limitations, and court deadlines.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Tracking billable hours</h3>
                  <p className="text-sm text-gray-600">How to record time entries and associate them with specific cases and clients.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Creating invoices</h3>
                  <p className="text-sm text-gray-600">Steps for generating invoices from time entries and expenses.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Setting up billing rates</h3>
                  <p className="text-sm text-gray-600">Managing default rates for different staff members and custom rates for specific clients.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Uploading and organizing documents</h3>
                  <p className="text-sm text-gray-600">Best practices for document storage and organization within the system.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Document version control</h3>
                  <p className="text-sm text-gray-600">How to track changes and maintain version history for important documents.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-primary hover:underline cursor-pointer">Document sharing and permissions</h3>
                  <p className="text-sm text-gray-600">Managing access permissions and sharing documents with clients and co-counsel.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Need additional help?</h2>
        <p className="text-gray-600 mb-4">Our support team is available Monday to Friday, 9am-5pm ET</p>
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
            Contact Support
          </button>
          <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5">
            Schedule Training
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;
