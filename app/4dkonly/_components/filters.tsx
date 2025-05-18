import { MultiSelect } from "@/components/multi-select";
import { Input } from "@/components/ui/input";
import { useTicketTypes } from "@/hooks/use-registrations";
import { useSetSearchParam } from "@/hooks/use-set-search-param";
import { RegistrationStatus } from "@prisma/client";

type BarcodeFiltersType = {
  customerName?: string;
  ticketType?: string;
  status?: string;
};

export default function RegistrationFilters({
  filters,
}: {
  filters: BarcodeFiltersType;
}) {
  const setSearchParams = useSetSearchParam();

  const { customerName, ticketType, status } = filters;

  const { data: ticketTypes } = useTicketTypes();

  const ticketTypeOptions = ticketTypes?.success
    ? ticketTypes?.data?.map((type) => ({
        label: type.name,
        value: type.name,
      }))
    : [];

  const registrationStatusList = Object.values(RegistrationStatus);

  const registrationStatusOptions = registrationStatusList.map(
    (registrationStatus) => ({
      label: registrationStatus,
      value: registrationStatus,
    }),
  );
  return (
    <div className="grid grid-cols-1 gap-2 sm:flex">
      <Input
        className="max-w-sm"
        defaultValue={customerName}
        placeholder="Search Customer..."
        onChange={(e) =>
          setSearchParams({ key: "customerName", value: e.target.value })
        }
      />
      <MultiSelect
        label="Ticket Type"
        options={ticketTypeOptions ?? []}
        selected={
          ticketTypeOptions
            ?.filter((ticketValue) => ticketType?.includes(ticketValue.value))
            .map((ticket) => ticket.value) ?? []
        }
        onChange={(e) =>
          setSearchParams({ key: "ticketType", value: e.toString() })
        }
      />
      <MultiSelect
        label="Status"
        options={registrationStatusOptions ?? []}
        selected={
          registrationStatusOptions
            ?.filter((type) => status?.includes(type.value))
            .map((type) => type.value) ?? []
        }
        onChange={(e) =>
          setSearchParams({ key: "status", value: e.toString() })
        }
      />
    </div>
  );
}
