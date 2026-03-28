'use client';
import { useState, useCallback } from 'react';
import type { GameState, ParameterTileType, HexId, PlacementConstraint } from '@/engine/types';
import { getValidHexesForPlacement } from '@/engine/rules';

interface PlacementRequest {
  type: ParameterTileType | 'city';
  playerId: string;
  constraint?: PlacementConstraint;
  onComplete: (hexId: HexId) => void;
  onCancel?: () => void;
}

export function usePlacementMode(gameState: GameState | null) {
  const [request, setRequest] = useState<PlacementRequest | null>(null);

  const validHexIds = gameState && request
    ? getValidHexesForPlacement(gameState, request.type, request.playerId, request.constraint)
    : [];

  const startPlacement = useCallback((req: PlacementRequest) => setRequest(req), []);
  const cancelPlacement = useCallback(() => {
    request?.onCancel?.();
    setRequest(null);
  }, [request]);
  const selectHex = useCallback((hexId: HexId) => {
    if (request && validHexIds.includes(hexId)) {
      request.onComplete(hexId);
      // Clear on next tick so gameState updates first
      setTimeout(() => setRequest(null), 0);
    }
  }, [request, validHexIds]);

  return {
    isActive: request !== null,
    validHexIds,
    startPlacement,
    cancelPlacement,
    selectHex,
  };
}
