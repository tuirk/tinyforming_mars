'use client';

import type { Player, PlayerProjectCard, StandardProject } from '@/lib/game/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCardView } from './ProjectCardView';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STANDARD_PROJECTS } from '@/lib/game/constants';

interface ActionPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onActivateCard: (card: PlayerProjectCard) => void;
  onStandardProject: (project: StandardProject) => void;
  onPass: () => void;
}

export function ActionPanel({
  player,
  isCurrentPlayer,
  onActivateCard,
  onStandardProject,
  onPass,
}: ActionPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-headline mb-4">Actions</h2>
      <Tabs defaultValue="projects" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Project Cards</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="flex-grow mt-4">
          <ScrollArea className="h-[calc(100vh-320px)] pr-4">
            <div className="space-y-4">
              {player.projectCards.length > 0 ? (
                player.projectCards.map((pCard) => (
                  <ProjectCardView
                    key={pCard.card.id}
                    playerCard={pCard}
                    onActivate={() => onActivateCard(pCard)}
                    canActivate={isCurrentPlayer && !pCard.usedThisGeneration}
                    playerId={player.id}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center">No project cards in hand.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="standard" className="flex-grow mt-4">
          <div className="space-y-2">
            {STANDARD_PROJECTS.map((project) => (
              <Button
                key={project.id}
                variant="secondary"
                className="w-full justify-start text-left h-auto py-2"
                disabled={!isCurrentPlayer}
                onClick={() => onStandardProject(project)}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{project.title}</span>
                  <span className="text-xs text-muted-foreground">{project.description} ({project.cost}C)</span>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button onClick={onPass} disabled={!isCurrentPlayer} className="w-full" variant="outline">
          Pass
        </Button>
      </div>
    </div>
  );
}
