"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegistrationDetails } from "./registration-details";

type Registration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  referenceNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  tickets: Array<{
    id: string;
    quantity: number;
    dancer: string;
    ticketType: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  paymentProof?: {
    id: string;
    imageUrl: string;
    uploadedAt: string;
  } | null;
};

type RegistrationListProps = {
  registrations: Registration[];
  isLoading: boolean;
  error: string | null;
};

export function RegistrationList({
  registrations,
  isLoading,
  error,
}: RegistrationListProps) {
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span className="ml-2">Loading registrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No registrations found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-mono text-xs">
                  {registration.referenceNumber}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{registration.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {registration.email}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(registration.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {registration.tickets.map((ticket) => (
                      <div key={ticket.id} className="text-xs">
                        {ticket.quantity}x {ticket.ticketType.name} (
                        {ticket.dancer})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ₱{registration.totalPrice.toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={registration.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(registration)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block">
                      View
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Reference Number: {selectedRegistration?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <RegistrationDetails registration={selectedRegistration} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

  switch (status) {
    case "CONFIRMED":
      variant = "default";
      break;
    case "PENDING":
      variant = "secondary";
      break;
    case "CANCELLED":
      variant = "destructive";
      break;
  }

  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}
