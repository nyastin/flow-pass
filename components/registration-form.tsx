"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Music,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCreateRegistration } from "@/hooks/use-mutations";

// Define ticket types and prices
const TICKET_PRICES = {
  VIP: 800,
  Regular: 500,
};

// Define dancers
const DANCERS = ["Justin", "Bea", "Edi", "Daryl"];

// Define a ticket item schema
const ticketItemSchema = z.object({
  type: z.enum(["VIP", "Regular"]),
  quantity: z.string().min(1),
  dancer: z.string().min(1, "Please select a dancer"),
});

// Define the form schema
const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  tickets: z.array(ticketItemSchema).min(1, "Please add at least one ticket"),
  specialRequirements: z.string().optional(),
});

// Helper function to calculate ticket price
const calculateTicketPrice = (type: string, quantity: string): number => {
  const price = type === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
  const qty = Number.parseInt(quantity) || 0;
  return price * qty;
};

export function RegistrationForm() {
  const [totalPrice, setTotalPrice] = useState(0);
  const prevTotalRef = useRef(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const createRegistrationMutation = useCreateRegistration();

  // Detailed price breakdown
  const [priceBreakdown, setPriceBreakdown] = useState<{
    vipCount: number;
    regularCount: number;
    vipTotal: number;
    regularTotal: number;
  }>({
    vipCount: 0,
    regularCount: 0,
    vipTotal: 0,
    regularTotal: 0,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      tickets: [{ type: "Regular", quantity: "1", dancer: "" }],
      specialRequirements: "",
    },
  });

  // Watch the tickets array for changes
  const tickets = form.watch("tickets");

  // Calculate total price whenever tickets change
  useEffect(() => {
    // Store previous total for animation comparison
    prevTotalRef.current = totalPrice;

    let newVipCount = 0;
    let newRegularCount = 0;
    let newVipTotal = 0;
    let newRegularTotal = 0;
    let newTotal = 0;

    // Calculate new totals
    tickets.forEach((ticket) => {
      const qty = Number.parseInt(ticket.quantity) || 0;
      const price =
        ticket.type === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
      const itemTotal = price * qty;

      // Add to appropriate category
      if (ticket.type === "VIP") {
        newVipCount += qty;
        newVipTotal += itemTotal;
      } else {
        newRegularCount += qty;
        newRegularTotal += itemTotal;
      }

      // Add to total
      newTotal += itemTotal;
    });

    // Update price breakdown
    setPriceBreakdown({
      vipCount: newVipCount,
      regularCount: newRegularCount,
      vipTotal: newVipTotal,
      regularTotal: newRegularTotal,
    });

    // Always update the total price to ensure it's current
    setTotalPrice(newTotal);
  }, [tickets]); // Only depend on tickets

  // Reset animation flag after animation completes
  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 500); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Add a new ticket item
  const addTicket = () => {
    const currentTickets = form.getValues("tickets");
    const newTickets = [
      ...currentTickets,
      { type: "Regular" as const, quantity: "1", dancer: "" },
    ];
    form.setValue("tickets", newTickets);

    // Recalculate totals immediately
    let newTotal = 0;
    let newVipCount = 0;
    let newRegularCount = 0;
    let newVipTotal = 0;
    let newRegularTotal = 0;

    newTickets.forEach((ticket) => {
      const qty = Number.parseInt(ticket.quantity) || 0;
      const price =
        ticket.type === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
      const itemTotal = price * qty;

      if (ticket.type === "VIP") {
        newVipCount += qty;
        newVipTotal += itemTotal;
      } else {
        newRegularCount += qty;
        newRegularTotal += itemTotal;
      }

      newTotal += itemTotal;
    });

    setPriceBreakdown({
      vipCount: newVipCount,
      regularCount: newRegularCount,
      vipTotal: newVipTotal,
      regularTotal: newRegularTotal,
    });
    setTotalPrice(newTotal);
  };

  // Remove a ticket item
  const removeTicket = (index: number) => {
    const currentTickets = form.getValues("tickets");
    if (currentTickets.length > 1) {
      const newTickets = currentTickets.filter((_, i) => i !== index);
      form.setValue("tickets", newTickets);

      // Recalculate totals immediately
      let newTotal = 0;
      let newVipCount = 0;
      let newRegularCount = 0;
      let newVipTotal = 0;
      let newRegularTotal = 0;

      newTickets.forEach((ticket) => {
        const qty = Number.parseInt(ticket.quantity) || 0;
        const price =
          ticket.type === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
        const itemTotal = price * qty;

        if (ticket.type === "VIP") {
          newVipCount += qty;
          newVipTotal += itemTotal;
        } else {
          newRegularCount += qty;
          newRegularTotal += itemTotal;
        }

        newTotal += itemTotal;
      });

      setPriceBreakdown({
        vipCount: newVipCount,
        regularCount: newRegularCount,
        vipTotal: newVipTotal,
        regularTotal: newRegularTotal,
      });
      setTotalPrice(newTotal);
    }
  };

  // Add a function to handle direct ticket type changes
  const handleTicketTypeChange = (index: number, value: string) => {
    // Update the form field
    form.setValue(`tickets.${index}.type`, value as "VIP" | "Regular");

    // Get current tickets
    const currentTickets = form.getValues("tickets");

    // Calculate new total immediately
    let newTotal = 0;
    let newVipCount = 0;
    let newRegularCount = 0;
    let newVipTotal = 0;
    let newRegularTotal = 0;

    currentTickets.forEach((ticket, i) => {
      // Use the new value for the changed ticket
      const ticketType = i === index ? value : ticket.type;
      const qty = Number.parseInt(ticket.quantity) || 0;
      const price =
        ticketType === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
      const itemTotal = price * qty;

      if (ticketType === "VIP") {
        newVipCount += qty;
        newVipTotal += itemTotal;
      } else {
        newRegularCount += qty;
        newRegularTotal += itemTotal;
      }

      newTotal += itemTotal;
    });

    // Update state directly
    setPriceBreakdown({
      vipCount: newVipCount,
      regularCount: newRegularCount,
      vipTotal: newVipTotal,
      regularTotal: newRegularTotal,
    });
    setTotalPrice(newTotal);
  };

  // Add a function to handle direct quantity changes
  const handleQuantityChange = (index: number, value: string) => {
    // Update the form field
    form.setValue(`tickets.${index}.quantity`, value);

    // Get current tickets
    const currentTickets = form.getValues("tickets");

    // Calculate new total immediately
    let newTotal = 0;
    let newVipCount = 0;
    let newRegularCount = 0;
    let newVipTotal = 0;
    let newRegularTotal = 0;

    currentTickets.forEach((ticket, i) => {
      // Use the new value for the changed ticket
      const qty =
        i === index
          ? Number.parseInt(value) || 0
          : Number.parseInt(ticket.quantity) || 0;
      const price =
        ticket.type === "VIP" ? TICKET_PRICES.VIP : TICKET_PRICES.Regular;
      const itemTotal = price * qty;

      if (ticket.type === "VIP") {
        newVipCount += qty;
        newVipTotal += itemTotal;
      } else {
        newRegularCount += qty;
        newRegularTotal += itemTotal;
      }

      newTotal += itemTotal;
    });

    // Update state directly
    setPriceBreakdown({
      vipCount: newVipCount,
      regularCount: newRegularCount,
      vipTotal: newVipTotal,
      regularTotal: newRegularTotal,
    });
    setTotalPrice(newTotal);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Generate reference number
    const referenceNumber = `4DK-${Date.now().toString().slice(-6)}`;

    // Prepare data for database
    const registrationData = {
      ...values,
      totalPrice,
      referenceNumber,
    };

    // Use the mutation to create the registration
    createRegistrationMutation.mutate(registrationData);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
        <CardDescription>
          Fill out the form below to register for the 4DK Dance Concert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+63 XXX XXX XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tickets</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicket}
                  className="h-8 text-xs flex items-center gap-1 border-teal-600 text-teal-500 hover:text-teal-600"
                >
                  <Plus className="h-3 w-3" /> Add Ticket
                </Button>
              </div>

              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-md bg-slate-800/50 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-teal-400" />
                      Ticket {index + 1}
                    </h4>
                    {tickets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicket(index)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`tickets.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Ticket Type</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTicketTypeChange(index, value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="VIP">VIP (₱800)</SelectItem>
                              <SelectItem value="Regular">
                                Regular (₱500)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tickets.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Quantity</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleQuantityChange(index, value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Qty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tickets.${index}.dancer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Supporting Dancer
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dancer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DANCERS.map((dancer) => (
                                <SelectItem key={dancer} value={dancer}>
                                  {dancer}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Per-ticket price calculation */}
                  <div className="text-right text-sm text-teal-400 font-medium">
                    Subtotal: ₱
                    {calculateTicketPrice(
                      ticket.type,
                      ticket.quantity,
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
              {form.formState.errors.tickets?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.tickets?.message}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any accessibility needs or special requests"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price breakdown and total */}
            <div className="rounded-lg bg-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-teal-400" />
                  Price Breakdown
                </span>
              </div>

              {priceBreakdown.vipCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>VIP Tickets ({priceBreakdown.vipCount}x):</span>
                  <span>₱{priceBreakdown.vipTotal.toLocaleString()}</span>
                </div>
              )}

              {priceBreakdown.regularCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Regular Tickets ({priceBreakdown.regularCount}x):</span>
                  <span>₱{priceBreakdown.regularTotal.toLocaleString()}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={totalPrice}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center"
                  >
                    <span className="text-xl font-bold text-teal-400">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              disabled={createRegistrationMutation.isPending}
            >
              {createRegistrationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
            {/* Floating total indicator */}
            <div className="fixed bottom-4 right-4 bg-slate-900 border border-teal-500 rounded-lg shadow-lg p-3 z-50 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Total Amount:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={totalPrice}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="font-bold text-teal-400"
                  >
                    ₱{totalPrice.toLocaleString()}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <Music className="h-4 w-4 mr-1 text-teal-400" />
          <span>Live performances</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-teal-400" />
          <span>Limited seats available</span>
        </div>
      </CardFooter>
    </Card>
  );
}
