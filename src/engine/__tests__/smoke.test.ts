import { describe, it, expect } from 'vitest';
import * as engine from '../index';

describe('Engine module', () => {
  it('exports type-related utilities', () => {
    expect(engine).toBeDefined();
  });

  it('exports map functions', () => {
    expect(engine.getMapHexes).toBeTypeOf('function');
    expect(engine.getAdjacentIds).toBeTypeOf('function');
  });

  it('exports card functions', () => {
    expect(engine.getCard).toBeTypeOf('function');
    expect(engine.getCardSide).toBeTypeOf('function');
  });

  it('exports game state functions', () => {
    expect(engine.createInitialState).toBeTypeOf('function');
    expect(engine.createGameState).toBeTypeOf('function');
  });

  it('exports rules functions', () => {
    expect(engine.countPlayerTags).toBeTypeOf('function');
    expect(engine.checkRequirements).toBeTypeOf('function');
    expect(engine.getLegalActions).toBeTypeOf('function');
  });

  it('exports action functions', () => {
    expect(engine.executeAction).toBeTypeOf('function');
  });

  it('exports income functions', () => {
    expect(engine.processIncomePhase).toBeTypeOf('function');
  });

  it('exports scoring functions', () => {
    expect(engine.checkEndCondition).toBeTypeOf('function');
    expect(engine.calculatePlayerScore).toBeTypeOf('function');
    expect(engine.calculateGameResult).toBeTypeOf('function');
  });

  it('exports standard project data and functions', () => {
    expect(engine.STANDARD_PROJECTS).toBeDefined();
    expect(engine.STANDARD_PROJECTS).toHaveLength(5);
    expect(engine.getStandardProject).toBeTypeOf('function');
    expect(engine.getStandardProject('sell_patent')).toBeDefined();
    expect(engine.getStandardProject('sell_patent')?.cost).toBe(1);
  });

  it('exports all 14 project cards', () => {
    expect(engine.PROJECT_CARDS).toBeDefined();
    expect(engine.PROJECT_CARDS).toHaveLength(14);
  });
});
