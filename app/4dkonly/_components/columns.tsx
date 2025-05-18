"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { dateFormats } from "@/utils/date-time";
import { StatusBadge } from "@/components/status-badge";
import { RegistrationWithRelations } from "@/services/admin";
import { NavigateButton } from "./navigate-button";

export const registrationColumns: ColumnDef<RegistrationWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "referenceNumber",
    header: "Reference #",
    cell: ({ row }) => <div>{row.original.referenceNumber}</div>,
  },
  {
    accessorKey: "fullName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.fullName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Customer",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "tickets",
    header: "Tickets",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.tickets.map((ticket) => (
          <div key={ticket.id} className="text-xs">
            {ticket.quantity}x {ticket.ticketType.name} ({ticket.dancer})
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Total",
    cell: ({ row }) => <div>₱{row.original.totalPrice.toLocaleString()}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <div>{dateFormats(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "updatedAt",
    header: "Date Modified",
    cell: ({ row }) => <div>{dateFormats(row.getValue("updatedAt"))}</div>,
  },
  {
    accessorKey: "id",
    header: "Actions",
    cell: ({ row }) => <NavigateButton rowData={row.original} />,
  },
];
