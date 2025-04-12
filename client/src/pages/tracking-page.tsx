import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Search, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Link } from "wouter";
import TrackingDetail from "@/components/shipping/tracking-detail";

// Tracking form schema
const trackingSchema = z.object({
  trackingNumber: z.string().min(8, "Tracking number must be at least 8 characters"),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();

  // Query to fetch tracking information
  const { data: trackingData, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/tracking", trackingNumber],
    queryFn: async () => {
      if (!trackingNumber) return null;
      
      try {
        const parsed = trackingSchema.parse({ trackingNumber });
        const response = await fetch(`/api/tracking/${parsed.trackingNumber}`);
        
        if (!response.ok) {
          throw new Error("Tracking information not found");
        }
        
        return await response.json();
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Invalid tracking number",
            description: error.errors[0].message,
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    enabled: false, // Don't run the query automatically
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      trackingSchema.parse({ trackingNumber });
      refetch();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid tracking number",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SmartShip Pro</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/">
              <a className="font-medium text-gray-600 hover:text-primary">Home</a>
            </Link>
            <Link href="/shipping">
              <a className="font-medium text-gray-600 hover:text-primary">Shipping</a>
            </Link>
            <Link href="/track">
              <a className="font-medium text-primary">Track</a>
            </Link>
            <a href="/#services" className="font-medium text-gray-600 hover:text-primary">Services</a>
            <a href="/#contact" className="font-medium text-gray-600 hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="outline" className="hidden md:inline-flex">Log In</Button>
            </Link>
            <Link href="/auth?register=true">
              <Button className="hidden md:inline-flex">Sign Up</Button>
            </Link>
            <Button variant="ghost" className="md:hidden p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
              <p className="text-gray-600">
                Enter your tracking number to get real-time updates on your shipment.
              </p>
            </div>

            {/* Tracking Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipment Tracking</CardTitle>
                <CardDescription>
                  Enter the tracking number provided in your shipping confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter tracking number (e.g. SHIP123456789)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tracking...
                      </>
                    ) : (
                      <>
                        Track <Search className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sample Tracking Result (will be replaced with actual data) */}
            {!trackingData && !isLoading && !isError && (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  No tracking information to display
                </h3>
                <p className="text-gray-500 mb-4">
                  Enter a tracking number above to see your shipment's status.
                </p>
              </div>
            )}

            {isError && (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-medium text-red-500 mb-2">
                  Tracking information not found
                </h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any information for the tracking number you provided.
                  Please check the number and try again.
                </p>
                <Button variant="outline" onClick={() => setTrackingNumber("")}>
                  Clear & Try Again
                </Button>
              </div>
            )}

            {/* Show enhanced tracking detail when tracking data is available */}
            {trackingData && (
              <TrackingDetail trackingNumber={trackingNumber} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">SmartShip Pro</span>
              </div>
              <p className="text-sm">
                Global logistics solutions for businesses and individuals.
              </p>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="/" className="hover:text-primary">Home</a></li>
                <li><a href="/shipping" className="hover:text-primary">Shipping</a></li>
                <li><a href="/track" className="hover:text-primary">Tracking</a></li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Services</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Package Delivery</a></li>
                <li><a href="#" className="hover:text-primary">Freight Shipping</a></li>
                <li><a href="#" className="hover:text-primary">International Shipping</a></li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Contact Us</h4>
              <ul className="space-y-1">
                <li>123 Shipping Street, LC 12345</li>
                <li>+1 (555) 123-4567</li>
                <li>info@smartshippro.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm">
            <p>© {new Date().getFullYear()} SmartShip Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}