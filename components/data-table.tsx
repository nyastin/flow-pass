"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2Icon,
} from "lucide-react";

type DataTableProps<TData, TValue> = {
  actions?: React.ReactNode;
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterBy?: Extract<keyof TData, string>;
  filters?: React.ReactNode;
  size: "sm" | "default" | "lg";
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  isEditing?: boolean;
  initialColumnVisibility?: VisibilityState;
  urlPrefix?: string;
  isPlaceholderData: boolean;
  onUpdatedData?: (data: TData[]) => void;
  setSelectedRows?: (data: TData[]) => void;
};

export function DataTable<TData, TValue>({
  actions,
  className,
  columns,
  data,
  filterBy,
  filters,
  size,
  pageIndex,
  pageSize,
  totalPages,
  initialColumnVisibility,
  isEditing,
  onUpdatedData,
  isPlaceholderData,
  urlPrefix = "",
  setSelectedRows,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdBy: false,
      createdAt: false,
      modifiedBy: false,
      updatedAt: false,
      ...initialColumnVisibility,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [updatedData, setUpdatedData] = React.useState(() => [...data]);

  const sizeToHeight = {
    sm: "h-[35vh]",
    default: "h-[45vh]",
    lg: "h-[69vh]",
  };

  const height = sizeToHeight[size];

  function handleUpdateData(
    rowIndex: number,
    columnId: string,
    value: boolean,
  ) {
    setUpdatedData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          } as TData;
        }
        return row;
      }),
    );
  }

  React.useEffect(() => {
    onUpdatedData?.(updatedData);
  }, [updatedData, onUpdatedData]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData: handleUpdateData,
      isEditing: isEditing,
    },
  });

  const nextPage = (by = 1) => {
    const sp = new URLSearchParams(searchParams);
    sp.set(
      `${urlPrefix}page`,
      (table.getState().pagination.pageIndex + by).toString(),
    );
    router.push(`${pathName}?${sp.toString()}`);
  };

  const prevPage = (by = 1) => {
    const sp = new URLSearchParams(searchParams);
    if (table.getState().pagination.pageIndex === 0) return;
    sp.set(
      `${urlPrefix}page`,
      (table.getState().pagination.pageIndex - by).toString(),
    );
    router.push(`${pathName}?${sp.toString()}`);
  };

  const pageSizes = [10, 25, 50, 100];

  const pageSizeChange = (size: number) => {
    const sp = new URLSearchParams(searchParams);
    sp.set(`${urlPrefix}limit`, size.toString());
    router.push(`${pathName}?${sp.toString()}`);
  };

  const debounced = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const search = e.target.value;
      const sp = new URLSearchParams();

      if (!search) sp.delete("search");
      else sp.set("search", search);

      router.push(`${pathName}?${sp.toString()}`);
    },
    300,
  );

  const flatRows = table.getSelectedRowModel().flatRows;

  React.useEffect(() => {
    table.toggleAllRowsSelected(false);
    setRowSelection([]);
  }, [data, table]);

  React.useEffect(() => {
    const rows = flatRows.map((row) => row.original);
    setSelectedRows?.(rows);
  }, [setSelectedRows, flatRows]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-x-4 pb-4">
        {filterBy ? (
          <Input
            className="max-w-sm"
            defaultValue={searchParams.get("search") ?? ""}
            placeholder={`Filter ${filterBy}s...`}
            onChange={debounced}
          />
        ) : (
          (filters ?? null)
        )}
        {actions ?? null}
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return column.columnDef.header ? (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="capitalize"
                      key={column.id}
                      onCheckedChange={(value: unknown) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.columnDef.header.toString()}
                    </DropdownMenuCheckboxItem>
                  ) : null;
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative overflow-auto rounded-md border">
        {isPlaceholderData ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Loader2Icon className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
        <ScrollArea className={cn("border-1 h-[45vh] rounded-md", height)}>
          <Table>
            <TableHeader className="z-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              className={cn(isPlaceholderData && "opacity-40 transition-all")}
            >
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                    onClick={() => {
                      row.toggleSelected(!row.getIsSelected());
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.columnDef.size }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-80 text-center"
                    colSpan={columns.length}
                  >
                    {!isPlaceholderData ? "No results." : null}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {pageIndex === 0 || totalPages === 0 || pageSize === 0 ? null : (
        <div className="flex items-center justify-end space-x-2 py-4 text-2xl">
          <div className="flex-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* Pagination info */}
              {pageIndex > 0 && totalPages > 0 && pageSize > 0 && (
                <span className="whitespace-nowrap">
                  Page {pageIndex} of {totalPages}
                </span>
              )}

              {/* Row count info */}
              <span className="whitespace-nowrap">
                Showing {table.getRowModel().rows.length} row(s)
                {table.getFilteredRowModel().rows.length !==
                  table.getRowModel().rows.length && (
                  <span className="text-muted-foreground/80">
                    {" "}
                    (filtered from {
                      table.getFilteredRowModel().rows.length
                    }{" "}
                    total)
                  </span>
                )}
              </span>

              {/* Selection info with fade transition */}
              <div className="relative h-5">
                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                  <span className="absolute whitespace-nowrap text-primary transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                    {table.getFilteredSelectedRowModel().rows.length} row(s)
                    selected
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="mr-5" variant="outline">
                  {table.getState().pagination.pageSize === 0
                    ? "All"
                    : table.getState().pagination.pageSize}{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pageSizes.map((size, key) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={pageSize === size}
                      key={key}
                      onCheckedChange={(value: unknown) => {
                        if (value) {
                          pageSizeChange(size);
                        }
                      }}
                    >
                      {size}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              disabled={pageIndex <= 1}
              size="icon"
              variant="outline"
              onClick={() => prevPage(pageIndex - 1)}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              disabled={pageIndex <= 1}
              size="icon"
              variant="outline"
              onClick={() => prevPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            {pageIndex > 5 ? (
              <Button size="icon" variant="ghost" onClick={() => prevPage(5)}>
                {pageIndex - 5}
              </Button>
            ) : (
              <Button disabled size="icon" variant="ghost">
                .
              </Button>
            )}

            <Button className="pointer-events-none" size="icon">
              {pageIndex}
            </Button>

            {pageIndex < totalPages - 5 ? (
              <Button size="icon" variant="ghost" onClick={() => nextPage(5)}>
                {pageIndex + 5}
              </Button>
            ) : (
              <Button disabled size="icon" variant="ghost">
                .
              </Button>
            )}

            <Button
              disabled={pageIndex >= totalPages}
              size="icon"
              variant="outline"
              onClick={() => nextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>

            <Button
              disabled={pageIndex >= totalPages}
              size="icon"
              variant="outline"
              onClick={() => nextPage(totalPages - pageIndex)}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
