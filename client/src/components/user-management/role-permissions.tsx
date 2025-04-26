import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for the permissions data structure
interface Permission {
  id: number;
  name: string;
  action_name: string;
}

interface Feature {
  feature_id: number;
  permissions: Permission[];
}

interface Module {
  module_id: number;
  features: {
    [key: string]: Feature;
  };
}

interface PermissionsData {
  [key: string]: Module;
}

interface RoleData {
  id: number;
  name: string;
}

interface RolePermissionsProps {
  roleName: string;
}

export default function RolePermissions({ roleName }: RolePermissionsProps) {
  const { toast } = useToast();
  const [permissionsData, setPermissionsData] = useState<PermissionsData | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<{[key: string]: {[key: string]: string[]}}>({}); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  interface PermissionAction {
    name: string;
    display: string;
  }
  
  // Permission actions with display names
  const permissionActions: PermissionAction[] = [
    { name: "create", display: "Create" },
    { name: "read", display: "Read" },
    { name: "update", display: "Update" },
    { name: "delete", display: "Delete" }
  ];
  
  useEffect(() => {
    if (roleName) {
      console.log('Role name changed to:', roleName);
      loadPermissions();
    }
  }, [roleName]);
  
  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Call the external API to get role permissions
      // Use our server-side proxy endpoint instead of direct API call
      const apiUrl = `/api/v1/roles/permissions_by_feature?role_name=${roleName}`;
      console.log('Calling API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.modules) {
        console.log('Received permissions data:', data);
        setPermissionsData(data.modules);
        initializeEditedPermissions(data.modules);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Error",
        description: `Failed to load role permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      // If the API fails, we'll use a fallback empty state
      setPermissionsData({});
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize the edited permissions state based on the loaded data
  const initializeEditedPermissions = (modules: PermissionsData) => {
    const initialEdited: {[key: string]: {[key: string]: string[]}} = {};
    
    Object.entries(modules).forEach(([moduleName, moduleData]) => {
      initialEdited[moduleName] = {};
      
      Object.entries(moduleData.features).forEach(([featureName, featureData]) => {
        initialEdited[moduleName][featureName] = featureData.permissions.map(p => p.name);
      });
    });
    
    setEditedPermissions(initialEdited);
  };
  
  // Toggle a permission for a feature
  const togglePermission = (moduleName: string, featureName: string, permissionName: string) => {
    setEditedPermissions(prev => {
      const newState = { ...prev };
      
      if (!newState[moduleName]) {
        newState[moduleName] = {};
      }
      
      if (!newState[moduleName][featureName]) {
        newState[moduleName][featureName] = [];
      }
      
      const permissions = [...newState[moduleName][featureName]];
      const index = permissions.indexOf(permissionName);
      
      if (index === -1) {
        permissions.push(permissionName);
      } else {
        permissions.splice(index, 1);
      }
      
      newState[moduleName][featureName] = permissions;
      return newState;
    });
  };
  
  // Check if a feature has a specific permission
  const hasPermission = (moduleName: string, featureName: string, permissionName: string): boolean => {
    if (!editedPermissions[moduleName] || !editedPermissions[moduleName][featureName]) {
      return false;
    }
    
    return editedPermissions[moduleName][featureName].includes(permissionName);
  };
  
  // Toggle expanding a module in the accordion
  const toggleExpandModule = (moduleName: string) => {
    setExpandedModules(prev => {
      if (prev.includes(moduleName)) {
        return prev.filter(name => name !== moduleName);
      } else {
        return [...prev, moduleName];
      }
    });
  };
  
  // Save the edited permissions
  const savePermissions = async () => {
    try {
      setIsSaving(true);
      
      // Format the data for the API
      const formattedData = {
        role_name: roleName,
        permissions: editedPermissions
      };
      
      // Call API to update permissions through our server proxy
      const apiUrl = `/api/v1/roles/update_permissions`;
      console.log('Saving permissions to API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Permissions updated successfully",
        });
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: `Failed to update permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading permissions...</span>
      </div>
    );
  }
  
  if (!permissionsData || Object.keys(permissionsData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions for {roleName.charAt(0).toUpperCase() + roleName.slice(1)} Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-4">
            <AlertTitle>No permissions data available</AlertTitle>
            <AlertDescription>
              There was an issue retrieving permissions data for this role. Please try again or contact support.
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={loadPermissions}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
          
          {/* Show mock data structure for debugging */}
          <div className="mt-4 p-4 border rounded-md bg-muted/30">
            <p className="text-sm font-medium mb-2">Expected Data Structure:</p>
            <pre className="text-xs overflow-auto p-2 bg-muted rounded">
              {JSON.stringify({
                "Account Management": {
                  module_id: 1,
                  features: {
                    "Create Account": {
                      feature_id: 1,
                      permissions: [
                        { id: 1, name: "create", action_name: "create" },
                        { id: 2, name: "read", action_name: "read" }
                      ]
                    }
                  }
                }
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions for {roleName.charAt(0).toUpperCase() + roleName.slice(1)} Role</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(permissionsData).length > 0 ? (
          <>
            <Accordion type="multiple" value={expandedModules} className="mb-6">
              {Object.entries(permissionsData).map(([moduleName, moduleData]) => (
                <AccordionItem 
                  key={moduleName} 
                  value={moduleName}
                  onClick={() => toggleExpandModule(moduleName)}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-medium">{moduleName}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border">
                      <div className="py-2 px-4 bg-muted text-sm font-medium grid grid-cols-5">
                        <div>Feature</div>
                        {permissionActions.map(action => (
                          <div key={action.name} className="text-center">{action.display}</div>
                        ))}
                      </div>
                      {Object.entries(moduleData.features).map(([featureName, featureData]) => (
                        <div 
                          key={featureName} 
                          className="py-3 px-4 border-t grid grid-cols-5 items-center"
                        >
                          <div className="text-sm">{featureName}</div>
                          {permissionActions.map(action => (
                            <div key={action.name} className="flex justify-center">
                              <Checkbox 
                                id={`${moduleName}-${featureName}-${action.name}`}
                                checked={hasPermission(moduleName, featureName, action.name)}
                                onCheckedChange={() => togglePermission(moduleName, featureName, action.name)}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="flex justify-end">
              <Button onClick={savePermissions} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Permissions
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>No permissions found</AlertTitle>
            <AlertDescription>
              No permissions data available for this role. Please try selecting a different role or contact support.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}