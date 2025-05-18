import { Badge } from "@/components/ui/badge";

export const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

  switch (status) {
    case "CONFIRMED":
      variant = "default";
      break;
    case "PENDING":
      variant = "secondary";
      break;
    case "CANCELLED":
      variant = "destructive";
      break;
  }

  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
};
