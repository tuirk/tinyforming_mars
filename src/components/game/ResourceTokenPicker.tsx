'use client';

import type { ResourceType } from '@/engine/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  NatureTokenStamp,
  ProductionTokenStamp,
  ScienceTokenStamp,
} from '@/components/game/GameIcons';

const TOKEN_META: {
  type: ResourceType;
  label: string;
  Stamp: typeof NatureTokenStamp;
}[] = [
  { type: 'nature', label: 'Nature', Stamp: NatureTokenStamp },
  { type: 'production', label: 'Production', Stamp: ProductionTokenStamp },
  { type: 'science', label: 'Science', Stamp: ScienceTokenStamp },
];

interface ResourceTokenPickerProps {
  open: boolean;
  available: ResourceType[];
  onPick: (token: ResourceType) => void;
  onCancel: () => void;
}

export function ResourceTokenPicker({
  open,
  available,
  onPick,
  onCancel,
}: ResourceTokenPickerProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Choose a resource token</DialogTitle>
          <DialogDescription>
            Gain one available token from the supply.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {TOKEN_META.map(({ type, label, Stamp }) => {
            const enabled = available.includes(type);
            return (
              <button
                key={type}
                data-testid={`token-${type}`}
                type="button"
                disabled={!enabled}
                onClick={() => onPick(type)}
                className={`flex flex-col items-center gap-2 rounded-md border px-3 py-4 transition-colors ${
                  enabled
                    ? 'border-border bg-accent/20 hover:bg-accent/40 cursor-pointer'
                    : 'border-border/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <Stamp size={28} />
                <span className="text-xs font-medium capitalize">{label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
