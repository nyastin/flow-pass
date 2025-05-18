"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRegistration,
  savePaymentProof,
  getRegistrationByReferenceNumber,
} from "@/services/registration";
import { uploadFile } from "@/services/storage";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Hook for creating a registration
export function useCreateRegistration() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Failed to create registration",
          variant: "destructive",
        });
        return;
      }

      // Store minimal data in sessionStorage for checkout page
      const checkoutData = {
        registrationId: data.data.id,
        fullName: data.data.fullName,
        email: data.data.email,
        phone: data.data.phone,
        tickets: data.data.tickets.map((ticket) => ({
          type: ticket.ticketType.name,
          quantity: String(ticket.quantity),
          dancer: ticket.dancer,
        })),
        totalPrice: data.data.totalPrice,
        priceBreakdown: {
          vipCount: data.data.tickets
            .filter((t) => t.ticketType.name === "VIP")
            .reduce((sum, t) => sum + t.quantity, 0),
          regularCount: data.data.tickets
            .filter((t) => t.ticketType.name === "Regular")
            .reduce((sum, t) => sum + t.quantity, 0),
          vipTotal: data.data.tickets
            .filter((t) => t.ticketType.name === "VIP")
            .reduce((sum, t) => sum + t.quantity * t.ticketType.price, 0),
          regularTotal: data.data.tickets
            .filter((t) => t.ticketType.name === "Regular")
            .reduce((sum, t) => sum + t.quantity * t.ticketType.price, 0),
        },
        referenceNumber: data.data.referenceNumber,
      };

      // Save to sessionStorage
      sessionStorage.setItem("4dk-registration", JSON.stringify(checkoutData));

      queryClient.invalidateQueries({ queryKey: ["registrations"] });

      // Navigate to checkout page
      router.push("/checkout");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "There was a problem processing your registration. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook for uploading a file
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      referenceNumber,
    }: {
      file: File;
      referenceNumber: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("referenceNumber", referenceNumber);
      return uploadFile(formData);
    },
  });
}

// Hook for saving payment proof
export function useSavePaymentProof() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      registrationId,
      imageUrl,
      referenceNumber,
    }: {
      registrationId: string;
      imageUrl: string;
      referenceNumber: string;
    }) => {
      const result = await savePaymentProof(registrationId, imageUrl);

      if (result.success) {
        // Store the reference number in sessionStorage for the confirmation page
        sessionStorage.setItem("4dk-confirmation", referenceNumber);
      }

      return result;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Failed to save payment proof",
          variant: "destructive",
        });
        return;
      }

      // Navigate to confirmation page
      setTimeout(() => {
        router.push("/confirmation");
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook for fetching registration by reference number
export function useRegistrationByReferenceNumber(
  referenceNumber: string | null,
) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["registration", referenceNumber],
    queryFn: async () => {
      if (!referenceNumber) {
        return { success: false, error: "No reference number provided" };
      }
      return getRegistrationByReferenceNumber(referenceNumber);
    },
    enabled: !!referenceNumber,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch registration details",
        variant: "destructive",
      });
    },
  });
}
