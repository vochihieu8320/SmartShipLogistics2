import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Package, Calculator, Plus, Trash2 } from "lucide-react";

const packageSchema = z.object({
  weight: z.coerce.number().min(0.1, "Weight must be greater than 0"),
  length: z.coerce.number().min(1, "Length must be greater than 0"),
  width: z.coerce.number().min(1, "Width must be greater than 0"),
  height: z.coerce.number().min(1, "Height must be greater than 0")
});

const quoteFormSchema = z.object({
  country_id: z.string().min(1, "Please select a destination country"),
  packages: z.array(packageSchema).min(1, "At least one package is required")
});

export default function PublicQuotePage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [bearerToken, setBearerToken] = useState<string | null>(null); // Added state for bearer token

  const form = useForm({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      country_id: "",
      packages: [{ weight: 1, length: 10, width: 10, height: 10 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages"
  });

  useEffect(() => {
    // Fetch countries -  Bearer token needs to be added here,  replace 'YOUR_BEARER_TOKEN'
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/countries`, {
          headers: {
            Authorization: `Bearer YOUR_BEARER_TOKEN` // Replace with actual token retrieval
          }
        });
        const data = await response.json();
        setCountries(data.countries || []);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();

  }, []);

  const onSubmit = async (data: z.infer<typeof quoteFormSchema>) => {
    setLoading(true);
    try {
      //Added Bearer token to the request header. Replace 'YOUR_BEARER_TOKEN' with the actual token.
      const response = await fetch(`${API_BASE_URL}/shipments/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_BEARER_TOKEN` // Replace with actual token retrieval
        },
        body: JSON.stringify({
          country_id: data.country_id,
          packages: data.packages.map(p => ({...p, volume: (p.length * p.width * p.height) / 1000000})) //Added volume calculation to the request
        }),
      });
      const result = await response.json();
      setQuotes(result.quotes || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Get Shipping Quote</h1>
            <p className="text-gray-600 mt-2">
              Compare shipping rates instantly - no account required
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Enter Package Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="country_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id.toString()}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const packageItem = form.getValues(`packages.${index}`);
                      return(
                        <div key={field.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Package #{index + 1}</h3>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`packages.${index}.weight`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Weight (kg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`packages.${index}.length`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Length (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`packages.${index}.width`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Width (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`packages.${index}.height`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Height (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* Display volume */}
                          <div className="mt-2 text-sm text-gray-600">
                            Volume: {((packageItem.length || 0) * (packageItem.width || 0) * (packageItem.height || 0) / 1000000).toFixed(2)} m³
                          </div>
                        </div>
                      )
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => append({ weight: 1, length: 10, width: 10, height: 10 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Package
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>Calculating...</>
                    ) : (
                      <>Calculate Rates</>
                    )}
                  </Button>
                </form>
              </Form>

              {quotes.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-medium text-lg">Available Shipping Options</h3>
                  <div className="space-y-3">
                    {quotes.map((quote, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{quote.name}</h4>
                              <p className="text-sm text-gray-500">
                                Estimated delivery: {quote.estimated_days} days
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND"
                                }).format(quote.total_price)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}