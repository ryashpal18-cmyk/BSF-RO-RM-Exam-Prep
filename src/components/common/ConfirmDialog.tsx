import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[110] animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl animate-fade-in">
          <Dialog.Title className="font-semibold text-base mb-1">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-black/60 dark:text-white/60 mb-4">
              {description}
            </Dialog.Description>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              size="sm"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
