'use client';
import { useState, useCallback } from 'react';
import type { GameState, ParameterTileType, HexId, PlacementConstraint } from '@/engine/types';
import { getValidHexesForPlacement } from '@/engine/rules';

interface PlacementRequest {
  type: ParameterTileType | 'city' | 'custom';
  playerId: string;
  constraint?: PlacementConstraint;
  /** When set, use these hexes instead of computing from type/constraint. */
  validHexIds?: HexId[];
  /** When relocating a city, ignore adjacency to this city hex. */
  ignoreCityHexId?: HexId;
  /** Optional UI hint shown while placement is active. */
  prompt?: string;
  onComplete: (hexId: HexId) => void;
  onCancel?: () => void;
}

export function usePlacementMode(gameState: GameState | null) {
  const [request, setRequest] = useState<PlacementRequest | null>(null);

  const validHexIds: HexId[] =
    gameState && request
      ? request.validHexIds
        ? request.validHexIds
        : request.type === 'custom'
          ? []
          : getValidHexesForPlacement(
              gameState,
              request.type,
              request.playerId,
              request.constraint,
              request.ignoreCityHexId != null
                ? { ignoreCityHexId: request.ignoreCityHexId }
                : undefined,
            )
      : [];

  const startPlacement = useCallback((req: PlacementRequest) => setRequest(req), []);
  const cancelPlacement = useCallback(() => {
    request?.onCancel?.();
    setRequest(null);
  }, [request]);
  const selectHex = useCallback(
    (hexId: HexId) => {
      if (request && validHexIds.includes(hexId)) {
        const complete = request.onComplete;
        // Clear first so chained startPlacement inside onComplete is not wiped.
        setRequest(null);
        complete(hexId);
      }
    },
    [request, validHexIds],
  );

  return {
    isActive: request !== null,
    validHexIds,
    prompt: request?.prompt ?? null,
    startPlacement,
    cancelPlacement,
    selectHex,
  };
}
