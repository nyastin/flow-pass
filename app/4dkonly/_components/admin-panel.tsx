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
import { Loader2Icon } from "lucide-react";

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

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2Icon className="h-12 w-12 text-teal-400 animate-spin" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">Admin Panel</h1>
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
