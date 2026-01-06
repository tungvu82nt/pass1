/**
 * ConfigHealthIndicator Component
 * Hiển thị trạng thái configuration health cho developers
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useConfigurationHealth } from '@/hooks/use-configuration-health';
import { cn } from '@/lib/utils';

/**
 * Component props
 */
interface ConfigHealthIndicatorProps {
  showInProduction?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * ConfigHealthIndicator Component
 * Chỉ hiển thị trong development mode hoặc khi có lỗi critical
 */
export const ConfigHealthIndicator = ({ 
  showInProduction = false, 
  compact = false,
  className 
}: ConfigHealthIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    health,
    checkHealth,
    isChecking
  } = useConfigurationHealth();

  // Không hiển thị trong production trừ khi có lỗi critical hoặc được force
  const isProduction = import.meta.env.PROD;
  if (isProduction && !showInProduction && !health.errors.length) {
    return null;
  }

  // Không hiển thị nếu chưa có health data
  if (!health.lastCheck) {
    return null;
  }

  const hasErrors = health.errors.length > 0;
  const hasWarnings = health.warnings.length > 0;
  const isHealthy = health.isHealthy;

  /**
   * Get health indicator color và icon
   */
  const getHealthIndicator = () => {
    if (hasErrors) {
      return {
        color: 'destructive' as const,
        icon: XCircle,
        text: 'Critical Issues'
      };
    }
    
    if (hasWarnings) {
      return {
        color: 'secondary' as const,
        icon: AlertTriangle,
        text: 'Warnings'
      };
    }
    
    return {
      color: 'default' as const,
      icon: CheckCircle,
      text: 'Healthy'
    };
  };

  const { color, icon: Icon, text } = getHealthIndicator();

  /**
   * Compact view cho development
   */
  if (compact) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "gap-2",
            hasErrors && "border-red-500 text-red-600",
            hasWarnings && "border-yellow-500 text-yellow-600"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">Config</span>
          <Badge variant={color} className="ml-1">
            {healthScore}
          </Badge>
        </Button>
        
        {isExpanded && (
          <Card className="absolute bottom-12 right-0 w-80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration Health
              </CardTitle>
              <CardDescription>
                Environment: {status.environment} | API Sync: {status.apiSyncEnabled ? 'On' : 'Off'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Health Score */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Health Score</span>
                <Badge variant={color}>{healthScore}/100</Badge>
              </div>
              
              {/* Production Ready */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Production Ready</span>
                <Badge variant={isProductionReady ? 'default' : 'destructive'}>
                  {isProductionReady ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              {/* Issues Summary */}
              {(hasErrors || hasWarnings) && (
                <div className="space-y-2">
                  {hasErrors && (
                    <div className="text-sm text-red-600">
                      <strong>{errorCount} Error{errorCount > 1 ? 's' : ''}</strong>
                    </div>
                  )}
                  {hasWarnings && (
                    <div className="text-sm text-yellow-600">
                      <strong>{warningCount} Warning{warningCount > 1 ? 's' : ''}</strong>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshStatus}
                className="w-full"
              >
                Refresh Status
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /**
   * Full view cho detailed information
   */
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Configuration Health - {text}
          <Badge variant={color} className="ml-auto">
            {healthScore}/100
          </Badge>
        </CardTitle>
        <CardDescription>
          Environment: {status.environment} | API Sync: {status.apiSyncEnabled ? 'Enabled' : 'Disabled'} | Production Ready: {isProductionReady ? 'Yes' : 'No'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Errors Section */}
        {hasErrors && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="destructive" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {errorCount} Error{errorCount > 1 ? 's' : ''}
                </span>
                <span>Show Details</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {status.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Warnings Section */}
        {hasWarnings && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="secondary" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {warningCount} Warning{warningCount > 1 ? 's' : ''}
                </span>
                <span>Show Details</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {status.warnings.map((warning, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">{warning}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Recommendations Section */}
        {status.recommendations.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {status.recommendations.length} Recommendation{status.recommendations.length > 1 ? 's' : ''}
                </span>
                <span>Show Details</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {status.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Healthy State */}
        {isHealthy && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                Configuration is healthy and ready for use.
              </p>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={refreshStatus}
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          Refresh Configuration Status
        </Button>
      </CardContent>
    </Card>
  );
};