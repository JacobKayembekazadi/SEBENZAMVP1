import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientCredentials {
  username: string;
  password: string;
}

interface ClientPortalLoginProps {
  onSuccess?: (clientData: any) => void;
  invoiceId?: string; // For direct invoice access
  quoteId?: string; // For direct quote access
}

export function ClientPortalLogin({ onSuccess, invoiceId, quoteId }: ClientPortalLoginProps) {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<ClientCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ClientCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual client authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock client data - replace with actual API response
      const mockClientData = {
        id: 'client_1',
        username: credentials.username,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        companyName: 'Acme Corporation',
        type: 'business',
        cases: [
          { id: 'case_1', title: 'Contract Review', status: 'active' },
          { id: 'case_2', title: 'Employment Dispute', status: 'pending' }
        ],
        hasUnreadMessages: 2,
        pendingInvoices: 3,
        lastLogin: new Date().toISOString(),
      };

      // Store client auth token
      localStorage.setItem('client_auth_token', 'mock-client-jwt-token');
      localStorage.setItem('client_data', JSON.stringify(mockClientData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${mockClientData.firstName}!`,
      });

      onSuccess?.(mockClientData);
    } catch (error) {
      setErrors({ general: 'Invalid credentials. Please check your username and password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageDescription = () => {
    if (invoiceId) {
      return "Please log in to view your invoice and make a payment.";
    }
    if (quoteId) {
      return "Please log in to view your quote and accept the proposal.";
    }
    return "Access your cases, documents, invoices, and communicate with your legal team.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Client Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            {getPageDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {(invoiceId || quoteId) && (
            <Alert className="mb-6">
              <Shield size={16} />
              <AlertDescription>
                {invoiceId && "You're accessing an invoice. "}
                {quoteId && "You're accessing a quote. "}
                Please log in to continue securely.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Portal'
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Client Account:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Username:</strong> johndoe</p>
                <p><strong>Password:</strong> client123</p>
              </div>
            </div>

            {/* Help Links */}
            <div className="space-y-2 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline block w-full"
                disabled={isSubmitting}
              >
                Forgot your password?
              </button>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline block w-full"
                disabled={isSubmitting}
              >
                Need help accessing your account?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 