"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { RegistrationModal } from "./modal";
import { RegistrationWithRelations } from "@/services/admin";

type NavigateButtonProps = {
  rowData: RegistrationWithRelations;
};

export const NavigateButton = (props: NavigateButtonProps) => {
  const { rowData } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:inline-block">View</span>
      </Button>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <RegistrationModal data={rowData} open={open} setOpen={setOpen} />
      </div>
    </>
  );
};
