/**
 * DevTools Component
 * Development utilities và debugging tools
 * Chỉ hiển thị trong development mode
 */

import { useState } from 'react';
import { Code, Database, Settings, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConfigHealthIndicator } from './ConfigHealthIndicator';
import { useConfigHealth, useConfigSummary } from '@/hooks/use-config-health';
import { usePasswords } from '@/hooks/use-passwords';
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

/**
 * DevTools Component Props
 */
interface DevToolsProps {
  className?: string;
}

/**
 * DevTools Component
 * Comprehensive development tools cho debugging và monitoring
 */
export const DevTools = ({ className }: DevToolsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  
  const { status: configStatus, healthScore } = useConfigHealth();
  const configSummary = useConfigSummary();
  const { passwords, stats, loading, error } = usePasswords();

  // Chỉ hiển thị trong development
  if (import.meta.env.PROD) {
    return null;
  }

  /**
   * Toggle visibility
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    logger.debug('DevTools visibility toggled', { isVisible: !isVisible });
  };

  /**
   * Clear all data (for testing)
   */
  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all password data? This cannot be undone.')) {
      try {
        // This would need to be implemented in usePasswords
        logger.warn('Clear all data requested from DevTools');
        alert('Clear data functionality needs to be implemented');
      } catch (error) {
        logger.error('Failed to clear data', error as Error);
      }
    }
  };

  /**
   * Export configuration for debugging
   */
  const handleExportConfig = () => {
    const configData = {
      summary: configSummary,
      status: configStatus,
      healthScore,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.info('Configuration exported for debugging');
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
        className={cn(
          "fixed bottom-4 left-4 z-50 gap-2",
          isVisible && "bg-primary text-primary-foreground"
        )}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="hidden sm:inline">DevTools</span>
        <Badge variant="secondary" className="ml-1">
          DEV
        </Badge>
      </Button>

      {/* DevTools Panel */}
      {isVisible && (
        <Card className={cn(
          "fixed bottom-16 left-4 w-96 max-h-[70vh] overflow-auto z-40 shadow-lg",
          className
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              Development Tools
            </CardTitle>
            <CardDescription>
              Debug utilities và system monitoring
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Perf
                </TabsTrigger>
              </TabsList>
              
              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Configuration Health</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Health Score:</div>
                    <Badge variant={healthScore > 80 ? 'default' : 'destructive'}>
                      {healthScore}/100
                    </Badge>
                    
                    <div>Environment:</div>
                    <Badge variant="outline">
                      {configStatus?.environment || 'unknown'}
                    </Badge>
                    
                    <div>API Sync:</div>
                    <Badge variant={configStatus?.apiSyncEnabled ? 'default' : 'secondary'}>
                      {configStatus?.apiSyncEnabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleExportConfig}
                      className="w-full text-xs"
                    >
                      Export Config Debug
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Data Tab */}
              <TabsContent value="data" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Database Status</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Total Passwords:</div>
                    <Badge variant="outline">{stats.total}</Badge>
                    
                    <div>Loading:</div>
                    <Badge variant={loading ? 'destructive' : 'default'}>
                      {loading ? 'Yes' : 'No'}
                    </Badge>
                    
                    <div>Error:</div>
                    <Badge variant={error ? 'destructive' : 'default'}>
                      {error ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                
                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Data Actions</h4>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleClearData}
                    className="w-full text-xs"
                  >
                    Clear All Data
                  </Button>
                </div>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Performance Metrics</h4>
                  <div className="text-xs text-muted-foreground">
                    Performance monitoring sẽ được implement trong tương lai
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Memory Usage</h4>
                  <div className="text-xs text-muted-foreground">
                    Memory tracking sẽ được implement trong tương lai
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </>
  );
};