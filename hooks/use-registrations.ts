"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  type TicketFilter,
} from "@/services/admin";
import { getTicketTypes } from "@/services/admin";

export function useRegistrations(filters: TicketFilter) {
  return useQuery({
    queryKey: ["registrations", filters],
    queryFn: () => getAllRegistrations(filters),
  });
}

export function useRegistration(id: string) {
  return useQuery({
    queryKey: ["registration", id],
    queryFn: () => getRegistrationById(id),
    enabled: !!id,
  });
}

export function useTicketTypes() {
  return useQuery({
    queryKey: ["ticketTypes"],
    queryFn: () => getTicketTypes(),
  });
}

export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}
