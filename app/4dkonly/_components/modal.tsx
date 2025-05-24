"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationWithRelations } from "@/services/admin";
import { RegistrationDetails } from "./registration-details";

type BaseModalProps = {
  data: RegistrationWithRelations;
  // id?: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RegistrationModal = (props: BaseModalProps) => {
  const { open, setOpen, data } = props;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
        </DialogHeader>
        {data && <RegistrationDetails registration={data} />}
      </DialogContent>
    </Dialog>
  );
};
