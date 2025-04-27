import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Package, Truck } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Define the shipment interface based on the API response
interface Shipment {
  id: number;
  tracking_number: string;
  status: string | null;
  created_at: string;
  sender: {
    name: string;
    city: string;
    country: string | null;
  };
  receiver: {
    name: string;
    city: string;
    country: string;
  };
  total_price: number | null;
  credentials: {
    key: string;
    value: string;
  }[];
}

interface ShipmentsResponse {
  success: boolean;
  count: number;
  shipments: Shipment[];
}

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch shipments data
  const { data, isLoading, error } = useQuery<ShipmentsResponse>({
    queryKey: ["shipments"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/shipments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }
      return response.json();
    },
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching shipments",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter shipments based on search term
  const filteredShipments = data?.shipments.filter((shipment) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      shipment.tracking_number?.toLowerCase().includes(searchTermLower) ||
      shipment.sender?.name?.toLowerCase().includes(searchTermLower) ||
      shipment.receiver?.name?.toLowerCase().includes(searchTermLower) ||
      shipment.sender?.city?.toLowerCase().includes(searchTermLower) ||
      shipment.receiver?.city?.toLowerCase().includes(searchTermLower)
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-500";

    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "in_transit":
      case "out_for_delivery":
        return "bg-blue-500";
      case "processing":
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format status for display
  const formatStatus = (status: string | null) => {
    if (!status) return "Pending";

    // Convert snake_case to Title Case
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
              <span className="font-medium text-gray-600 hover:text-primary cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/shipping">
              <span className="font-medium text-gray-600 hover:text-primary cursor-pointer">
                Shipping
              </span>
            </Link>
            <Link href="/tracking">
              <span className="font-medium text-gray-600 hover:text-primary cursor-pointer">
                Track
              </span>
            </Link>
            <Link href="/shipments">
              <span className="font-medium text-primary cursor-pointer">
                Shipments
              </span>
            </Link>
            <Link href="/#contact">
              <span className="font-medium text-gray-600 hover:text-primary cursor-pointer">
                Contact
              </span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="outline" className="hidden md:inline-flex">
                Log In
              </Button>
            </Link>
            <Link href="/auth?register=true">
              <Button className="hidden md:inline-flex">Sign Up</Button>
            </Link>
            <Button variant="ghost" className="md:hidden p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Shipments</h1>
              <p className="text-gray-600">
                View and manage all your shipments
              </p>
            </div>

            {/* Search and Filter */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Find Shipments</CardTitle>
                <CardDescription>
                  Search by tracking number, sender or recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>

            {/* Shipments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Shipments</CardTitle>
                <CardDescription>
                  Showing {filteredShipments?.length || 0} shipments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Failed to load shipments. Please try again.</p>
                  </div>
                ) : filteredShipments && filteredShipments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracking Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Sender</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>House Bill</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Air Way Bill</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredShipments.map((shipment) => (
                          <TableRow key={shipment.id}>
                            <TableCell className="font-medium">
                              {shipment.tracking_number}
                            </TableCell>
                            <TableCell>
                              {formatDate(shipment.created_at)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{shipment.sender.name}</div>
                                <div className="text-xs text-gray-500">
                                  {shipment.sender.city},{" "}
                                  {shipment.sender.country}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{shipment.receiver.name}</div>
                                <div className="text-xs text-gray-500">
                                  {shipment.receiver.city},{" "}
                                  {shipment.receiver.country}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusColor(shipment.status)} text-white`}
                              >
                                {formatStatus(shipment.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {shipment.total_price
                                ? `$${shipment.total_price}`
                                : "-"}
                            </TableCell>
                            {shipment.credentials?.map((credential) => (
                              <TableCell key={credential.key}>
                                {credential.key === "house_bill" && (
                                  <a
                                    href={credential.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 hover:underline"
                                  >
                                    {shipment.tracking_number}
                                  </a>
                                )}
                                {credential.key === "invoice" && (
                                  <a
                                    href={credential.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 hover:underline"
                                  >
                                    {shipment.invoice_number}
                                  </a>
                                )}
                                {credential.key === "air_way_bill" && (
                                  <a
                                    href={credential.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {credential.value}
                                  </a>
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <Link
                                href={`/tracking?number=${shipment.tracking_number}`}
                              >
                                <Button size="sm" variant="outline">
                                  Track
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      No shipments found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "You have no shipments yet."}
                    </p>
                    <Link href="/shipping">
                      <Button>Create a Shipment</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
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
                <span className="text-xl font-bold text-white">
                  SmartShip Pro
                </span>
              </div>
              <p className="text-sm">
                Global logistics solutions for businesses and individuals.
              </p>
            </div>

            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">
                Quick Links
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/">
                    <span className="hover:text-primary cursor-pointer">
                      Home
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/shipping">
                    <span className="hover:text-primary cursor-pointer">
                      Shipping
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/tracking">
                    <span className="hover:text-primary cursor-pointer">
                      Tracking
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/shipments">
                    <span className="hover:text-primary cursor-pointer">
                      Shipments
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">
                Services
              </h4>
              <ul className="space-y-1">
                <li>
                  <span className="hover:text-primary cursor-pointer">
                    Package Delivery
                  </span>
                </li>
                <li>
                  <span className="hover:text-primary cursor-pointer">
                    Freight Shipping
                  </span>
                </li>
                <li>
                  <span className="hover:text-primary cursor-pointer">
                    International Shipping
                  </span>
                </li>
              </ul>
            </div>

            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">
                Contact Us
              </h4>
              <ul className="space-y-1">
                <li>123 Shipping Street, LC 12345</li>
                <li>+1 (555) 123-4567</li>
                <li>info@smartshippro.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm">
            <p>
              © {new Date().getFullYear()} SmartShip Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
