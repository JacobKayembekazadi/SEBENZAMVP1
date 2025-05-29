import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TourStep {
  id: number;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action description
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Welcome to Your Dashboard",
    description: "This is your main dashboard where you can see an overview of your law firm's key metrics, revenue, active cases, and more.",
    target: "[data-tour='dashboard']",
    position: "bottom"
  },
  {
    id: 2,
    title: "Add New Clients",
    description: "Click here to add new clients to your system. You can store their contact information, company details, and case history.",
    target: "[data-tour='add-client']",
    position: "bottom",
    action: "Click 'Add Client' to create a new client record"
  },
  {
    id: 3,
    title: "Manage Your Cases",
    description: "Access your cases section to create new cases, track progress, assign attorneys, and manage case documents.",
    target: "[data-tour='cases']",
    position: "right",
    action: "Navigate to Cases to manage your legal matters"
  },
  {
    id: 4,
    title: "Create Invoices",
    description: "Generate and send professional invoices to your clients. Track payment status and manage billing efficiently.",
    target: "[data-tour='invoices']",
    position: "right",
    action: "Click 'Invoices' to manage billing"
  },
  {
    id: 5,
    title: "Track Time & Expenses",
    description: "Log billable hours and track expenses for accurate billing. Monitor your time spent on different cases and clients.",
    target: "[data-tour='time-tracking']",
    position: "right",
    action: "Use Time Tracking for accurate billing"
  },
  {
    id: 6,
    title: "Document Management",
    description: "Store, organize, and manage all your legal documents securely. Associate documents with specific cases and clients.",
    target: "[data-tour='documents']",
    position: "right",
    action: "Access Documents to manage your files"
  },
  {
    id: 7,
    title: "Financial Overview",
    description: "Monitor your firm's financial health with comprehensive accounting tools and expense tracking.",
    target: "[data-tour='accounting']",
    position: "right",
    action: "Check Accounting for financial management"
  },
  {
    id: 8,
    title: "AI Assistant",
    description: "Your intelligent legal assistant is always available to help with research, document drafting, and case analysis.",
    target: "[data-tour='ai-assistant']",
    position: "left",
    action: "Click the AI Assistant for intelligent help"
  },
  {
    id: 9,
    title: "Reports & Analytics",
    description: "Generate detailed reports about your firm's performance, case outcomes, and financial metrics.",
    target: "[data-tour='reports']",
    position: "right",
    action: "View Reports for business insights"
  },
  {
    id: 10,
    title: "Your Profile & Settings",
    description: "Complete your profile and customize your system settings. Don't forget to fill in all your information!",
    target: "[data-tour='settings']",
    position: "left",
    action: "Complete your profile in Settings"
  }
];

export function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Add styles to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes tour-pulse {
        0% { 
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.7); 
        }
        50% { 
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(59, 130, 246, 0.3); 
        }
        100% { 
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.7); 
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateHighlight = () => {
      const step = tourSteps[currentStep];
      if (!step) return;

      const targetElement = document.querySelector(step.target) as HTMLElement;
      if (!targetElement) {
        console.warn(`Tour target not found: ${step.target}`);
        return;
      }

      setHighlightedElement(targetElement);

      // Calculate tooltip position
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;

      let top = rect.top;
      let left = rect.left;

      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - 20;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left - tooltipWidth - 20;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + 20;
          break;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 10) left = 10;
      if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
      if (top < 10) top = 10;
      if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;

      setTooltipPosition({ top, left });

      // Scroll element into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        style={{ pointerEvents: 'none' }}
      />

      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            background: 'transparent',
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            animation: 'tour-pulse 2s infinite'
          }}
        />
      )}

      {/* Tour tooltip */}
      <Card 
        className="fixed z-[10000] w-80 shadow-2xl border-2 border-blue-500"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-600 text-white">
              Step {currentStepData.id} of {tourSteps.length}
            </Badge>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip tour
            </button>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
          
          {currentStepData.action && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                💡 {currentStepData.action}
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLastStep ? 'Finish Tour' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour progress dots */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[10000]">
        <div className="flex space-x-2 bg-white rounded-full px-4 py-2 shadow-lg border">
          {tourSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentStep 
                  ? 'bg-blue-600 scale-125' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
} 