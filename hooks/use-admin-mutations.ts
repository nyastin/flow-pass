"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllRegistrations, getRegistrationById, updateRegistrationStatus, getTicketTypes } from "@/services/admin"
import { useToast } from "@/hooks/use-toast"
import type { TicketFilter } from "@/services/admin"

// Hook for fetching all registrations
export function useRegistrations(filters: TicketFilter = {}) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["registrations", filters],
    queryFn: async () => {
      const result = await getAllRegistrations(filters)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch registrations",
          variant: "destructive",
        })
        throw new Error(result.error || "Failed to fetch registrations")
      }
      return result
    },
    retry: 1,
  })
}

// Hook for fetching a single registration
export function useRegistration(id: string) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["registration", id],
    queryFn: async () => {
      const result = await getRegistrationById(id)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch registration",
          variant: "destructive",
        })
        throw new Error(result.error || "Failed to fetch registration")
      }
      return result
    },
    enabled: !!id,
    retry: 1,
  })
}

// Hook for fetching ticket types
export function useTicketTypes() {
  const { toast } = useToast()

  return useQuery({
    queryKey: ["ticketTypes"],
    queryFn: async () => {
      const result = await getTicketTypes()
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch ticket types",
          variant: "destructive",
        })
        throw new Error(result.error || "Failed to fetch ticket types")
      }
      return result
    },
    retry: 1,
  })
}

// Hook for updating registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await updateRegistrationStatus(id, status)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to update registration status",
          variant: "destructive",
        })
        throw new Error(result.error || "Failed to update registration status")
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] })
      toast({
        title: "Status updated",
        description: "Registration status has been updated successfully.",
      })
    },
    onError: (error) => {
      console.error("Error updating registration status:", error)
    },
  })
}
