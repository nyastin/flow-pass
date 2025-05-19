"use client";

import { getAllRegistrations } from "@/services/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminStats } from "./admin-stats";
import { RegistrationsList } from "./data";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { QueryTabs } from "@/components/query-tab";

export function AdminPanel() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : 25;
  const customerName = searchParams.get("customerName") ?? undefined;
  const ticketType = searchParams.get("ticketType") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const {
    data: registrations,
    isLoading,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: [
      "registrations",
      { customerName, ticketType, status, page, limit },
    ],
    queryFn: () =>
      getAllRegistrations({ customerName, ticketType, status, page, limit }),
    retry: 0,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">4DK Admin Panel</h1>
      <QueryTabs
        defaultTab="Registrations"
        tabContent={{
          Registrations: (
            <div className="grid gap-6">
              <RegistrationsList
                page={page}
                limit={limit}
                isLoading={isLoading}
                isPlaceholderData={isPlaceholderData}
                error={error}
                data={registrations}
                customerName={customerName}
                ticketType={ticketType}
                status={status}
              />
            </div>
          ),
          Statistics: (
            <Card>
              <CardHeader>
                <CardTitle>Registration Statistics</CardTitle>
                <CardDescription>
                  Overview of ticket sales and registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminStats registrations={registrations?.data || []} />
              </CardContent>
            </Card>
          ),
        }}
        tabs={["Registrations", "Statistics"]}
      />
    </div>
  );
}
