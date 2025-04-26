import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, UserRole } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, UserX, Key, Edit, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Define a type for the external API user structure
interface ExternalUser {
  id: number;
  email: string;
  name?: string;
  username?: string;  // Add this for backward compatibility
  role_name?: string;
  role?: string;      // Add this for backward compatibility
  created_at?: string;
  updated_at?: string;
}

export default function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<ExternalUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Custom fetch function to use correct API endpoint
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log('[DEBUG] Fetching users with token');
    // Make sure we're using the correct API endpoint and method
    const apiUrl = `${API_BASE_URL}/users`;
    console.log('[DEBUG] API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] Failed to fetch users: ${response.status}`, errorText);
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Fetched users:', data);
    return data.users || []; // Ensure we return an array of users
  };
  
  const { data: users, isLoading, refetch } = useQuery<ExternalUser[]>({
    queryKey: ["/api/v1/users"],
    queryFn: fetchUsers,
    staleTime: 10000, // 10 seconds
    retry: 1
  });
  
  // Refresh user list when component mounts or when redirected back to list
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getUserRoleBadgeVariant = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.MANAGER:
        return "warning";
      case UserRole.STAFF:
        return "secondary";
      default:
        return "default";
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleDeleteUser = () => {
    toast({
      title: "User deleted",
      description: `${selectedUser?.name || selectedUser?.email} has been deleted.`,
    });
    setIsDeleteDialogOpen(false);
    // Refresh the user list after deletion
    setTimeout(() => refetch(), 500);
  };
  
  const handleResetPassword = () => {
    toast({
      title: "Password reset",
      description: `A password reset email has been sent to ${selectedUser?.email}.`,
    });
    setIsResetPasswordDialogOpen(false);
  };
  
  // Filter users based on search term
  const filteredUsers = users
    ? users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.role_name && user.role_name.toLowerCase().includes(searchLower))
        );
      })
    : [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[300px]"
        />
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name || 'User')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name || 'N/A'}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="capitalize">
                      {user.role_name || 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.created_at ? formatDate(user.created_at) : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetPasswordDialogOpen(true);
                          }}
                        >
                          <Key className="h-4 w-4 mr-2" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <UserX className="h-4 w-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name || selectedUser?.email || 'this user'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset email to {selectedUser?.email}. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
