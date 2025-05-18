"use client";

import type React from "react";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TicketFilter } from "@/services/admin";

interface RegistrationFiltersProps {
  ticketTypes: Array<{ id: string; name: string; price: number }>;
  onFilterChange: (filters: TicketFilter) => void;
}

export function RegistrationFilters({
  ticketTypes,
  onFilterChange,
}: RegistrationFiltersProps) {
  const [customerName, setCustomerName] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      customerName: customerName || undefined,
      ticketType: ticketType || undefined,
      status: status || undefined,
    });
  };

  const handleReset = () => {
    setCustomerName("");
    setTicketType("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="customerName" className="text-sm font-medium">
            Customer Name
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerName"
              placeholder="Search by name..."
              className="pl-8"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="ticketType" className="text-sm font-medium">
            Ticket Type
          </label>
          <Select value={ticketType} onValueChange={setTicketType}>
            <SelectTrigger id="ticketType">
              <SelectValue placeholder="All ticket types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ticket types</SelectItem>
              {ticketTypes?.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name} (₱{type.price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      </div>
    </form>
  );
}
