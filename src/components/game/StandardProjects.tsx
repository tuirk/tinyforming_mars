
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
  highlightPass?: boolean;
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
  energy_farms:
    'Gain 1 heat tile to your personal supply (+1 VP). Only Lava Flows places heat on the map.',
};

export function StandardProjects({
  canActivate,
  alreadyUsedThisGen,
  isHumanTurn,
  hasPassed,
  highlightPass,
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

  const passButton = onPass ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('min-w-0', passDisabled && 'cursor-not-allowed')} data-tutorial="pass-button">
          <Button
            variant={highlightPass && !passDisabled ? 'default' : 'secondary'}
            size="sm"
            className={cn(
              'h-8 w-full gap-1 px-1.5 py-0',
              passDisabled && 'opacity-50 pointer-events-none',
              highlightPass && !passDisabled && 'pass-nudge',
            )}
            disabled={passDisabled}
            onClick={onPass}
            onMouseEnter={onPassMouseEnter}
          >
            <PassStamp size={16} />
            <span className="text-[10px] leading-none truncate">{hasPassed ? 'Passed' : 'Pass'}</span>
            <span className={cn(
              'text-[10px] leading-none',
              highlightPass && !passDisabled ? 'text-primary-foreground/80' : 'text-muted-foreground',
            )}>0C</span>
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">
          {highlightPass && !passDisabled
            ? 'No other legal actions this turn. Pass to continue.'
            : 'End your actions for this generation. You cannot take any more actions after passing.'}
        </p>
      </TooltipContent>
    </Tooltip>
  ) : null;

  // Row 1: Sell · City · Pass — Row 2: Water · Green · Heat
  const row1Projects = STANDARD_PROJECTS.filter((p) => p.id === 'sell_patent' || p.id === 'build_city');
  const row2Projects = STANDARD_PROJECTS.filter(
    (p) => p.id === 'import_water' || p.id === 'greenhouses' || p.id === 'energy_farms',
  );

  function renderProject(project: (typeof STANDARD_PROJECTS)[number]) {
    const config = PROJECT_CONFIG[project.id];
    const Stamp = config.stamp;
    const disabled =
      !canActivate[project.id] || alreadyUsedThisGen || !isHumanTurn;
    const unavailableReason = getUnavailableReason(project.id);

    return (
      <Tooltip key={project.id}>
        <TooltipTrigger asChild>
          <div className={cn('min-w-0', disabled && 'cursor-not-allowed')}>
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                'h-8 w-full gap-1 px-1.5 py-0',
                disabled && 'opacity-50 pointer-events-none',
              )}
              disabled={disabled}
              onClick={() => onStandardProject(project.id)}
            >
              <Stamp size={16} />
              <span className="text-[10px] leading-none truncate">{config.label}</span>
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
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-3 gap-1.5" data-tutorial="standard-projects">
        {row1Projects.map(renderProject)}
        {passButton}
        {row2Projects.map(renderProject)}
      </div>
    </TooltipProvider>
  );
}
