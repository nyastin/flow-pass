"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Check, Loader2, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUpdateRegistrationStatus } from "@/hooks/use-admin-mutations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegistrationWithRelations } from "@/services/admin";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequirements?: string | null;
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
}

interface RegistrationDetailsProps {
  registration: RegistrationWithRelations;
}

export function RegistrationDetails({
  registration,
}: RegistrationDetailsProps) {
  const updateStatusMutation = useUpdateRegistrationStatus();
  const [expandedImage, setExpandedImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleStatusChange = async (status: string) => {
    updateStatusMutation.mutate({ id: registration.id, status });
  };

  const handleImageError = () => {
    setImageError(true);
    console.error("Failed to load payment proof image");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{registration.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{registration.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{registration.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(new Date(registration.createdAt), "PPP p")}</span>
              </div>
            </div>

            {registration.specialRequirements && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Special Requirements
                  </h4>
                  <p className="text-sm">{registration.specialRequirements}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Registration Status</h3>
              <Badge
                variant={
                  registration.status === "CONFIRMED"
                    ? "default"
                    : registration.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                }
              >
                {registration.status.toLowerCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference Number:</span>
                <span className="font-mono">
                  {registration.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">
                  ₱{registration.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Update Status</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={
                    registration.status === "CONFIRMED" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() => handleStatusChange("CONFIRMED")}
                  disabled={
                    updateStatusMutation.isPending ||
                    registration.status === "CONFIRMED"
                  }
                >
                  {updateStatusMutation.isPending &&
                  registration.status !== "CONFIRMED" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant={
                    registration.status === "PENDING" ? "secondary" : "outline"
                  }
                  className="flex-1"
                  onClick={() => handleStatusChange("PENDING")}
                  disabled={
                    updateStatusMutation.isPending ||
                    registration.status === "PENDING"
                  }
                >
                  {updateStatusMutation.isPending &&
                  registration.status !== "PENDING" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <span className="h-4 w-4 mr-1">⏱️</span>
                  )}
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={
                    registration.status === "CANCELLED"
                      ? "destructive"
                      : "outline"
                  }
                  className="flex-1"
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={
                    updateStatusMutation.isPending ||
                    registration.status === "CANCELLED"
                  }
                >
                  {updateStatusMutation.isPending &&
                  registration.status !== "CANCELLED" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Ticket Details</h3>
          <div className="space-y-2">
            {registration.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between py-2 border-b last:border-0"
              >
                <div>
                  <span className="font-medium">
                    {ticket.quantity}x {ticket.ticketType.name}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    (For {ticket.dancer})
                  </span>
                </div>
                <div className="text-right">
                  <div>₱{ticket.ticketType.price} each</div>
                  <div className="font-medium">
                    ₱
                    {(
                      ticket.quantity * ticket.ticketType.price
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2 font-medium">
              <span>Total</span>
              <span>₱{registration.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {registration.paymentProof && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Payment Proof</h3>
              <span className="text-sm text-muted-foreground">
                Uploaded on{" "}
                {format(
                  new Date(registration.paymentProof.uploadedAt),
                  "PPP p",
                )}
              </span>
            </div>

            {imageError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error loading image</AlertTitle>
                <AlertDescription>
                  The payment proof image could not be loaded. The image might
                  be missing or the URL is invalid.
                </AlertDescription>
              </Alert>
            ) : (
              <div
                className={`relative ${expandedImage ? "w-full" : "max-w-md mx-auto"}`}
              >
                <Image
                  src={registration.paymentProof.imageUrl || "/placeholder.svg"}
                  alt="Payment proof"
                  width={expandedImage ? 800 : 400}
                  height={expandedImage ? 600 : 300}
                  className="rounded-md object-contain cursor-pointer"
                  onClick={() => setExpandedImage(!expandedImage)}
                  onError={handleImageError}
                />
                {!imageError && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => setExpandedImage(!expandedImage)}
                  >
                    {expandedImage ? "Shrink" : "Expand"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
