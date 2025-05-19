"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRegistration,
  savePaymentProof,
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

      // Store minimal data in sessionStorage for checkout page
      const checkoutData = {
        registrationId: data.data?.id,
        fullName: data.data?.fullName,
        email: data.data?.email,
        phone: data.data?.phone,
        tickets: data.data?.tickets.map((ticket) => ({
          type: ticket.ticketType.name,
          quantity: String(ticket.quantity),
          dancer: ticket.dancer,
        })),
        totalPrice: data.data?.totalPrice,
        priceBreakdown: {
          vipCount: data.data?.tickets
            .filter((t) => t.ticketType.name === "VIP")
            .reduce((sum, t) => sum + t.quantity, 0),
          regularCount: data.data?.tickets
            .filter((t) => t.ticketType.name === "Regular")
            .reduce((sum, t) => sum + t.quantity, 0),
          vipTotal: data.data?.tickets
            .filter((t) => t.ticketType.name === "VIP")
            .reduce((sum, t) => sum + t.quantity * t.ticketType.price, 0),
          regularTotal: data.data?.tickets
            .filter((t) => t.ticketType.name === "Regular")
            .reduce((sum, t) => sum + t.quantity * t.ticketType.price, 0),
        },
        referenceNumber: data.data?.referenceNumber,
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
        toast("Uh oh! Something went wrong.", {
          description: data.error || "Failed to save payment proof",
        });
        return;
      }

      // Navigate to confirmation page
      setTimeout(() => {
        router.push("/confirmation");
      }, 1000);
    },
    onError: (error) => {
      toast.error("Uh oh! Something went wrong.", {
        description:
          error.message ||
          "There was a problem processing your payment. Please try again.",
      });
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
