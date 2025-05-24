"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRegistration,
  getRegistrationByReferenceNumber,
} from "@/services/registration";
import { uploadFile } from "@/services/storage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hook for creating a registration
export function useCreateRegistration() {
  const router = useRouter();

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error("Uh oh! Something went wrong.", {
          description: data.error || "Failed to create registration",
        });
        return;
      }

      // Calculate total ticket count for display
      const totalTicketCount = data.data?.tickets.length;

      // Store minimal data in sessionStorage for checkout page
      const checkoutData = {
        registrationId: data.data?.id,
        fullName: data.data?.fullName,
        email: data.data?.email,
        phone: data.data?.phone,
        tickets: data.data?.tickets.map((ticket) => ({
          type: ticket.ticketType.name,
          quantity: "1", // Each ticket is now individual
          dancer: ticket.dancer,
        })),
        totalPrice: data.data?.totalPrice,
        priceBreakdown: {
          vipCount: data.data?.tickets.filter(
            (t) => t.ticketType.name === "VIP",
          ).length,
          regularCount: data.data?.tickets.filter(
            (t) => t.ticketType.name === "Regular",
          ).length,
          vipTotal: data.data?.tickets
            .filter((t) => t.ticketType.name === "VIP")
            .reduce((sum, t) => sum + t.ticketType.price, 0),
          regularTotal: data.data?.tickets
            .filter((t) => t.ticketType.name === "Regular")
            .reduce((sum, t) => sum + t.ticketType.price, 0),
        },
        referenceNumber: data.data?.referenceNumber,
        ticketCount: totalTicketCount,
      };

      // Save to sessionStorage
      sessionStorage.setItem("4dk-registration", JSON.stringify(checkoutData));

      // Navigate to checkout page
      router.push("/checkout");
    },
    onError: (error) => {
      toast.error("Uh oh! Something went wrong.", {
        description:
          error.message ||
          "There was a problem processing your registration. Please try again.",
      });
    },
  });
}

// Hook for uploading a file
export function useUploadFile() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      file,
      referenceNumber,
      registrationId,
    }: {
      file: File;
      referenceNumber: string;
      registrationId: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("referenceNumber", referenceNumber);
      formData.append("registrationId", registrationId);
      const result = await uploadFile(formData);
      if (result.success) {
        // Store the reference number in sessionStorage for the confirmation page
        sessionStorage.setItem("4dk-confirmation", referenceNumber);
      }

      return result;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast("Uh oh! Something went wrong.", {
          description: data.error || "Failed to save payment proof",
        });
        return;
      }

      // Navigate to confirmation page
      router.push("/confirmation");
    },
  });
}

// Hook for fetching registration by reference number
export function useRegistrationByReferenceNumber(
  referenceNumber: string | null,
) {
  return useQuery({
    queryKey: ["registration", referenceNumber],
    queryFn: async () => {
      if (!referenceNumber) {
        return { success: false, error: "No reference number provided" };
      }
      return getRegistrationByReferenceNumber(referenceNumber);
    },
    enabled: !!referenceNumber,
  });
}
