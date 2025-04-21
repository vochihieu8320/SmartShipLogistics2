import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

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
    loadPermissions();
  }, [roleName]);
  
  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      
      // In a real application, you'd fetch this from an API
      // For now, using the provided JSON data for manager role
      const mockData = {
        "modules": {
          "Home & Login": {
            "module_id": 7,
            "features": {
              "User Registration": {
                "feature_id": 1,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "User Login": {
                "feature_id": 2,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Role Assignment": {
                "feature_id": 3,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              }
            }
          },
          "Account Management": {
            "module_id": 10,
            "features": {
              "Create Account": {
                "feature_id": 17,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Discount Setup": {
                "feature_id": 18,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "KPI Setup": {
                "feature_id": 20,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Module Permissions": {
                "feature_id": 19,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              }
            }
          },
          "Order Management": {
            "module_id": 8,
            "features": {
              "Create Order": {
                "feature_id": 4,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Price Quote": {
                "feature_id": 8,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Create House Bill": {
                "feature_id": 5,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Create Invoice": {
                "feature_id": 6,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Create Shipment": {
                "feature_id": 7,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Custom Pricing": {
                "feature_id": 9,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Booking Management": {
                "feature_id": 10,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Weight Update": {
                "feature_id": 11,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              }
            }
          },
          "Financial Management": {
            "module_id": 9,
            "features": {
              "Price Management": {
                "feature_id": 12,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Daily Transactions": {
                "feature_id": 13,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              },
              "Debit Export": {
                "feature_id": 14,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Customer Debt": {
                "feature_id": 15,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Growth Reports": {
                "feature_id": 16,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              }
            }
          },
          "Notifications": {
            "module_id": 11,
            "features": {
              "Change Notifications": {
                "feature_id": 21,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              }
            }
          },
          "Reporting": {
            "module_id": 12,
            "features": {
              "Dashboard": {
                "feature_id": 22,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Growth Trends": {
                "feature_id": 23,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "User Performance": {
                "feature_id": 24,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              },
              "Role Assessment": {
                "feature_id": 25,
                "permissions": [
                  { "id": 27, "name": "read", "action_name": "read" }
                ]
              }
            }
          }
        }
      };
      
      setPermissionsData(mockData.modules);
      initializeEditedPermissions(mockData.modules);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load role permissions",
        variant: "destructive"
      });
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
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
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
  
  if (!permissionsData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No permissions data available for this role.
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions for {roleName.charAt(0).toUpperCase() + roleName.slice(1)} Role</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}