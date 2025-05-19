"use client";

import { DataTable } from "@/components/data-table";
import { GetAllRegistrationsResponse } from "@/services/admin";
import { registrationColumns } from "./columns";
import RegistrationFilters from "./filters";

export type RegistrationListProps = {
  actions?: React.ReactNode;
  page: number;
  limit: number;
  customerName?: string;
  ticketType?: string;
  status?: string;
  isLoading: boolean;
  isPlaceholderData: boolean;
  error: Error | null;
  data: GetAllRegistrationsResponse | undefined;
  // setSelectedRegistrations(registrations: Registration[]): void;
};

export const RegistrationsList = ({
  page,
  limit,
  customerName,
  ticketType,
  status,
  isLoading,
  isPlaceholderData,
  error,
  data,
}: RegistrationListProps) => {
  if (isLoading) {
    return (
      <DataTable
        isPlaceholderData
        columns={registrationColumns}
        data={[]}
        pageIndex={1}
        pageSize={1}
        size="lg"
        totalPages={1}
      />
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  } else if (!data) {
    return <div>No Serial Numbers found</div>;
  }

  return (
    <DataTable
      // actions={actions}
      columns={registrationColumns}
      data={data?.data ?? []}
      filters={
        <RegistrationFilters filters={{ customerName, ticketType, status }} />
      }
      // filterBy=""
      isPlaceholderData={isPlaceholderData}
      pageIndex={page}
      pageSize={limit}
      size="lg"
      totalPages={data?.meta?.total ?? 1}
    />
  );
};
