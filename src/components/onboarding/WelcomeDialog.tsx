import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DialogTitle } from '@/components/ui/dialog';

interface WelcomeDialogProps {
  isOpen: boolean;
  userName: string;
  profileCompleteness: number;
  isFirstLogin: boolean;
  onStartTour: () => void;
  onSkipTour: () => void;
  onCompleteProfile: () => void;
}

export function WelcomeDialog({
  isOpen,
  userName,
  profileCompleteness,
  isFirstLogin,
  onStartTour,
  onSkipTour,
  onCompleteProfile
}: WelcomeDialogProps) {
  const [showProfileReminder, setShowProfileReminder] = useState(profileCompleteness < 100);

  if (!isOpen) return null;

  const isProfileIncomplete = profileCompleteness < 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <div className="text-white text-3xl">👋</div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-4">
            {isFirstLogin ? `Welcome to Sebenza System, ${userName}!` : `Welcome back, ${userName}!`}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {isFirstLogin 
              ? "We're excited to help you manage your law firm more efficiently."
              : "Ready to continue managing your law firm with ease?"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Completion Section */}
          {isProfileIncomplete && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-amber-600 text-lg">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Your profile is {profileCompleteness}% complete. Completing your profile helps us provide better recommendations and ensures all features work optimally.
                  </p>
                  <Progress value={profileCompleteness} className="h-2 mb-3" />
                  <Button
                    size="sm"
                    onClick={onCompleteProfile}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Complete Profile Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tour Section */}
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isFirstLogin ? "Ready for a quick tour?" : "Need a refresher tour?"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isFirstLogin 
                  ? "We'll show you the key features and how to navigate the system. It only takes 2-3 minutes!"
                  : "Take a guided tour to discover new features or refresh your memory on key functionality."
                }
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-xs font-medium text-gray-700">Client Management</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-1">⚖️</div>
                  <div className="text-xs font-medium text-gray-700">Case Tracking</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-xs font-medium text-gray-700">Billing & Invoices</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs font-medium text-gray-700">AI Assistant</div>
                </div>
              </div>
            </div>

            {/* Tour Decision Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onStartTour}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                size="lg"
              >
                🚀 Yes, Start the Tour (2-3 minutes)
              </Button>
              
              <Button
                onClick={onSkipTour}
                variant="outline"
                className="w-full py-3"
                size="lg"
              >
                ⏭️ {isFirstLogin ? "Skip for now, I'll explore myself" : "No thanks, I know my way around"}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>💡 You can always access the tour later from Settings → Help & Tutorials</p>
              {isFirstLogin && (
                <p>🎯 The tour highlights the 10 most important features for law firm management</p>
              )}
            </div>
          </div>

          {/* Quick Stats Preview */}
          {!isFirstLogin && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Your Firm at a Glance
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">48</div>
                  <div className="text-xs text-gray-600">Active Clients</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">32</div>
                  <div className="text-xs text-gray-600">Active Cases</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">$129K</div>
                  <div className="text-xs text-gray-600">Monthly Revenue</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 