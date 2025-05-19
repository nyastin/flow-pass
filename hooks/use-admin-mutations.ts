"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  getTicketTypes,
} from "@/services/admin";
import type { TicketFilter } from "@/services/admin";
import { toast } from "sonner";

// Hook for fetching all registrations
export function useRegistrations(filters: TicketFilter) {
  return useQuery({
    queryKey: ["registrations", filters],
    queryFn: async () => {
      const result = await getAllRegistrations(filters);
      if (!result.success) {
        toast.error("Uh oh! Something went wrong.", {
          description: result.error || "Failed to fetch registrations",
        });
        throw new Error(result.error || "Failed to fetch registrations");
      }
      return result;
    },
    retry: 1,
  });
}

// Hook for fetching a single registration
export function useRegistration(id: string) {
  return useQuery({
    queryKey: ["registration", id],
    queryFn: async () => {
      const result = await getRegistrationById(id);
      if (!result.success) {
        toast.error("Uh oh! Something went wrong.", {
          description: result.error || "Failed to fetch registration",
        });
        throw new Error(result.error || "Failed to fetch registration");
      }
      return result;
    },
    enabled: !!id,
    retry: 1,
  });
}

// Hook for fetching ticket types
export function useTicketTypes() {
  return useQuery({
    queryKey: ["ticketTypes"],
    queryFn: async () => {
      const result = await getTicketTypes();
      if (!result.success) {
        toast.error("Uh oh! Something went wrong.", {
          description: result.error || "Failed to fetch ticket types",
        });
        throw new Error(result.error || "Failed to fetch ticket types");
      }
      return result;
    },
    retry: 1,
  });
}

// Hook for updating registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await updateRegistrationStatus(id, status);
      if (!result.success) {
        toast.error("Uh oh! Something went wrong.", {
          description: result.error || "Failed to update registration status",
        });
        throw new Error(result.error || "Failed to update registration status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration status updated successfully.", {
        description: "Status updated",
      });
    },
    onError: (error) => {
      console.error("Error updating registration status:", error);
    },
  });
}
