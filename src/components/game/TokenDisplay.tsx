
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TokenDisplayProps {
  label: string;
  value: number;
  tooltip: string;
  isClickable: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TokenDisplay({ label, value, tooltip, isClickable, onClick, children }: TokenDisplayProps) {
  const containerClasses = cn(
    'flex flex-col items-center gap-1 transition-transform duration-200',
    isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'
  );

  const handleClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={containerClasses} onClick={handleClick}>
            {children}
            <span className="font-bold text-md">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
