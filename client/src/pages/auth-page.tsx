import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertUser, loginUserSchema, insertUserSchema, LoginCredentials, UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center mb-2">
              <Package className="h-6 w-6 text-primary mr-2" />
              <span className="text-2xl font-bold">SmartShip Pro</span>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-primary p-12 text-white justify-center items-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">
            Modern Logistics Management System
          </h1>
          <p className="text-lg mb-8">
            SmartShip Pro helps you manage shipments, track deliveries, handle payments, and generate insightful reports - all in one platform.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Book shipments with major carriers worldwide
            </li>
            <li className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Track orders and delivery status in real-time
            </li>
            <li className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Manage payments and generate financial reports
            </li>
            <li className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Secure multi-role access for your entire team
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  function onSubmit(data: LoginCredentials) {
    setIsLoggingIn(true);
    
    // Simple login
    if (data.username === 'admin' && data.password === 'password') {
      toast({
        title: "Login successful",
        description: "Welcome back, Admin User!",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setIsLoggingIn(false);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: UserRole.STAFF
    }
  });
  
  function onSubmit(data: InsertUser) {
    setIsRegistering(true);
    
    // Simple mock registration
    setTimeout(() => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      setIsRegistering(false);
      form.reset();
    }, 1500);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                  <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </Form>
  );
}
