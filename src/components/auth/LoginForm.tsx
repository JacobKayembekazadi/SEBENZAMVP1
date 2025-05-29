import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { useAppState } from '@/lib/store';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { dispatch } = useAppState();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data - replace with actual API response
      const mockUser = {
        id: '1',
        email: formData.email,
        firstName: 'John',
        lastName: 'Attorney',
        role: 'attorney' as const,
        isActive: true,
        profileComplete: formData.email === 'complete@example.com', // For demo purposes
        isFirstLogin: formData.email === 'newuser@example.com', // For demo purposes
      };

      // Update global state
      dispatch({ type: 'SET_USER', payload: mockUser });

      // Store auth token
      if (formData.rememberMe) {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('remember_user', 'true');
      } else {
        sessionStorage.setItem('auth_token', 'mock-jwt-token');
      }

      // Store user preferences
      localStorage.setItem('user_preferences', JSON.stringify({
        needsTour: mockUser.isFirstLogin,
        profileComplete: mockUser.profileComplete,
        lastLogin: new Date().toISOString(),
      }));

      onSuccess?.();
    } catch (error) {
      setErrors({ general: 'Login failed. Please check your credentials and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <div className="text-white text-2xl font-bold">AO</div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Advocate Ops Hub
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your law firm management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                disabled={isSubmitting}
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                Remember me for 30 days
              </Label>
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
                'Sign In'
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>New User (with tour):</strong> newuser@example.com / password</p>
                <p><strong>Complete Profile:</strong> complete@example.com / password</p>
                <p><strong>Regular User:</strong> user@example.com / password</p>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                disabled={isSubmitting}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 