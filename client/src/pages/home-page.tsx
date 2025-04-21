import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Package,
  Search,
  Truck,
  Clock,
  CreditCard,
  BarChart,
  Globe,
} from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
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
            <a href="/" className="font-medium text-primary">
              Home
            </a>
            <a
              href="/shipping/create"
              className="font-medium text-gray-600 hover:text-primary"
            >
              Shipping
            </a>
            <a
              href="/tracking"
              className="font-medium text-gray-600 hover:text-primary"
            >
              Track
            </a>
            <a
              href="#services"
              className="font-medium text-gray-600 hover:text-primary"
            >
              Services
            </a>
            <a
              href="#contact"
              className="font-medium text-gray-600 hover:text-primary"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="outline" className="hidden md:inline-flex">
                Log In
              </Button>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Global Shipping <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Fast, reliable, and secure logistics solutions tailored to meet
              your shipping needs worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shipping">
                <Button size="lg" className="gap-2">
                  Ship Now <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tracking">
                <Button size="lg" variant="outline" className="gap-2">
                  Track Shipment <Search className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-primary rounded-lg opacity-10 blur-xl"></div>
            <div className="relative bg-white p-8 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Quick Track</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Tracking Number
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter tracking number"
                    className="flex-1 rounded-l-md border border-r-0 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button className="rounded-l-none">Track</Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Enter your tracking number to get real-time updates on your
                shipment.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive logistics solutions tailored to meet the needs of
              businesses and individuals worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <Package className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Package Delivery</h3>
              <p className="text-gray-600">
                Fast and secure door-to-door package delivery services with
                real-time tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <Truck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Freight Shipping</h3>
              <p className="text-gray-600">
                Efficient transportation for large shipments by air, ocean, or
                land.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                International Shipping
              </h3>
              <p className="text-gray-600">
                Global logistics solutions with customs clearance and
                documentation support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <BarChart className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Supply Chain Solutions
              </h3>
              <p className="text-gray-600">
                End-to-end visibility and management of your global supply
                chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose SmartShip Pro
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer innovative logistics solutions with a focus on
              reliability, speed, and customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Optimized routes and efficient processes ensure your packages
                arrive on time, every time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your shipments 24/7 with our advanced tracking system
                and get instant updates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple payment options with advanced security to protect your
                financial information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ship?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Create an account today and enjoy seamless shipping experiences with
            SmartShip Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shipping">
              <Button size="lg" variant="secondary" className="gap-2">
                Ship Now <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth?register=true">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">
                  SmartShip Pro
                </span>
              </div>
              <p className="mb-4">
                Global logistics solutions for businesses and individuals.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white text-lg font-semibold mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:text-primary">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/shipping" className="hover:text-primary">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="/tracking" className="hover:text-primary">
                    Tracking
                  </a>
                </li>
                <li>
                  <a href="/shipments" className="hover:text-primary">
                    Shipments
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-primary">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/auth" className="hover:text-primary">
                    Login / Register
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-lg font-semibold mb-4">
                Services
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Package Delivery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Freight Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    International Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Supply Chain Solutions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Customs Clearance
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-lg font-semibold mb-4">
                Contact Us
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>123 Shipping Street, Logistics City, LC 12345</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@smartshippro.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>
              © {new Date().getFullYear()} SmartShip Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
