import { Block, GameMode } from '../types';
import { GRID_COLS, MIN_VALUE, MAX_VALUE, TARGET_SUM_MIN, TARGET_SUM_MAX } from '../constants';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const createBlock = (row: number, col: number): Block => ({
  id: generateId(),
  value: Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
  row,
  col,
});

export const generateInitialBlocks = (rows: number): Block[] => {
  const blocks: Block[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      blocks.push(createBlock(r, c));
    }
  }
  return blocks;
};

export const generateTargetSum = (): number => {
  return Math.floor(Math.random() * (TARGET_SUM_MAX - TARGET_SUM_MIN + 1)) + TARGET_SUM_MIN;
};

export const addNewRow = (blocks: Block[]): Block[] => {
  // Shift existing blocks up
  const shiftedBlocks = blocks.map(b => ({ ...b, row: b.row + 1 }));
  
  // Add new row at the bottom (row 0)
  const newRow: Block[] = [];
  for (let c = 0; c < GRID_COLS; c++) {
    newRow.push(createBlock(0, c));
  }
  
  return [...shiftedBlocks, ...newRow];
};

export const checkGameOver = (blocks: Block[], maxRows: number): boolean => {
  return blocks.some(b => b.row >= maxRows);
};
