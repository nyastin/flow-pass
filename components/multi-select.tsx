import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

export type OptionType = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: OptionType[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  disabled?: boolean;
  label?: string;
};

function MultiSelect({
  disabled,
  options,
  selected,
  onChange,
  className,
  label,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props} modal={true}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={`w-full justify-between ${selected.length > 0 ? "h-auto p-2" : "h-10"}`}
          disabled={disabled}
          role="combobox"
          variant="outline"
          onClick={() => setOpen(!open)}
        >
          {selected.length === 0 && `Select ${label ?? "items"}...`}
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <Badge
                className=""
                key={item}
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnselect(item);
                }}
              >
                {options.find((option) => option.value === item)?.label}
                {disabled ? null : (
                  <div
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </div>
                )}
              </Badge>
            ))}
          </div>
          {disabled ? null : (
            <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command className={className}>
          <CommandList>
            <CommandInput placeholder={`Search ${label ?? "items"}...`} />
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.value)
                        ? selected.filter((item) => item !== option.value)
                        : [...selected, option.value],
                    );
                    setOpen(true);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
