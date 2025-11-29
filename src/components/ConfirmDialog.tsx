import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onOpenChange,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
