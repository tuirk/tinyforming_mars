
'use client';

import type { StandardProjectId } from '@/engine/types';
import { STANDARD_PROJECTS } from '@/engine/standardProjects';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Coins, Building2, Droplets, Leaf, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandardProjectsProps {
  canActivate: Record<StandardProjectId, boolean>;
  alreadyUsedThisGen: boolean;
  isHumanTurn: boolean;
  onStandardProject: (projectId: StandardProjectId) => void;
}

const PROJECT_CONFIG: Record<
  StandardProjectId,
  { icon: React.ElementType; label: string }
> = {
  sell_patent: { icon: Coins, label: 'Sell' },
  build_city: { icon: Building2, label: 'City' },
  import_water: { icon: Droplets, label: 'Water' },
  greenhouses: { icon: Leaf, label: 'Green' },
  energy_farms: { icon: Flame, label: 'Heat' },
};

const EFFECT_DESCRIPTIONS: Record<StandardProjectId, string> = {
  sell_patent: 'Gain credits from the supply.',
  build_city: 'Place or relocate a city on an unoccupied land hex (max 2 cities, not adjacent to any city).',
  import_water: 'Place a water tile on a water hex.',
  greenhouses: 'Place a greenery tile on an unoccupied land hex.',
  energy_farms: 'Gain a heat tile to your personal supply.',
};

export function StandardProjects({
  canActivate,
  alreadyUsedThisGen,
  isHumanTurn,
  onStandardProject,
}: StandardProjectsProps) {
  const getUnavailableReason = (projectId: StandardProjectId): string | null => {
    if (alreadyUsedThisGen) return 'No: already used this generation';
    if (!isHumanTurn) return 'No: not your turn';
    if (!canActivate[projectId]) return 'No: not enough credits or requirements not met';
    return null;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-1.5" data-tutorial="standard-projects">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center">
          Standard Projects
        </p>
        <div className="flex gap-1.5 justify-center">
          {STANDARD_PROJECTS.map((project) => {
            const config = PROJECT_CONFIG[project.id];
            const Icon = config.icon;
            const disabled =
              !canActivate[project.id] || alreadyUsedThisGen || !isHumanTurn;
            const unavailableReason = getUnavailableReason(project.id);

            return (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <div className={cn(disabled && 'cursor-not-allowed')}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn(
                        'flex flex-col items-center gap-0.5 h-auto py-1.5 px-2 min-w-[52px]',
                        disabled && 'opacity-50 pointer-events-none',
                      )}
                      disabled={disabled}
                      onClick={() => onStandardProject(project.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px] leading-none">{config.label}</span>
                      <span className="text-[10px] leading-none text-yellow-400 font-bold">
                        {project.cost}C
                      </span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <div className="space-y-1">
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs">Cost: {project.cost} credits</p>
                    {project.tagRequirements.length > 0 && (
                      <p className="text-xs">
                        Requires:{' '}
                        {project.tagRequirements
                          .map((r) => `${r.count}x ${r.tag}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {EFFECT_DESCRIPTIONS[project.id]}
                    </p>
                    <p className={cn(
                      'text-xs font-medium',
                      unavailableReason ? 'text-amber-400' : 'text-green-400',
                    )}>
                      Available: {unavailableReason ?? 'Yes'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
