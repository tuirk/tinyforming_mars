
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
import { CreditsStamp, CityStamp, WaterStamp, GreeneryStamp, HeatStamp, PassStamp } from './GameIcons';
import { cn } from '@/lib/utils';

interface StandardProjectsProps {
  canActivate: Record<StandardProjectId, boolean>;
  alreadyUsedThisGen: boolean;
  isHumanTurn: boolean;
  hasPassed?: boolean;
  onStandardProject: (projectId: StandardProjectId) => void;
  onPass?: () => void;
  onPassMouseEnter?: () => void;
}

const PROJECT_CONFIG: Record<
  StandardProjectId,
  { stamp: React.ComponentType<{ size?: number }>; label: string }
> = {
  sell_patent: { stamp: CreditsStamp, label: 'Sell' },
  build_city: { stamp: CityStamp, label: 'City' },
  import_water: { stamp: WaterStamp, label: 'Water' },
  greenhouses: { stamp: GreeneryStamp, label: 'Green' },
  energy_farms: { stamp: HeatStamp, label: 'Heat' },
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
  hasPassed,
  onStandardProject,
  onPass,
  onPassMouseEnter,
}: StandardProjectsProps) {
  const getUnavailableReason = (projectId: StandardProjectId): string | null => {
    if (alreadyUsedThisGen) return 'No: already used this generation';
    if (!isHumanTurn) return 'No: not your turn';
    if (!canActivate[projectId]) return 'No: not enough credits or requirements not met';
    return null;
  };

  const passDisabled = !isHumanTurn || !!hasPassed;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2" data-tutorial="standard-projects">
        <div className="flex flex-wrap gap-2 justify-center">
          {STANDARD_PROJECTS.map((project) => {
            const config = PROJECT_CONFIG[project.id];
            const Stamp = config.stamp;
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
                        'flex flex-col items-center gap-0.5 h-auto py-2 px-3 min-w-[60px]',
                        disabled && 'opacity-50 pointer-events-none',
                      )}
                      disabled={disabled}
                      onClick={() => onStandardProject(project.id)}
                    >
                      <Stamp size={24} />
                      <span className="text-[11px] leading-none">{config.label}</span>
                      <span className="text-[11px] leading-none text-yellow-400 font-bold">
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

          {/* Pass button as an action button */}
          {onPass && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(passDisabled && 'cursor-not-allowed')} data-tutorial="pass-button">
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(
                      'flex flex-col items-center gap-0.5 h-auto py-2 px-3 min-w-[60px]',
                      passDisabled && 'opacity-50 pointer-events-none',
                    )}
                    disabled={passDisabled}
                    onClick={onPass}
                    onMouseEnter={onPassMouseEnter}
                  >
                    <PassStamp size={24} />
                    <span className="text-[11px] leading-none">{hasPassed ? 'Passed' : 'Pass'}</span>
                    <span className="text-[11px] leading-none text-muted-foreground">0C</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">End your turn for this generation. You cannot take any more actions after passing.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
