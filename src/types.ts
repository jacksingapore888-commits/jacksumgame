export type GameMode = 'classic' | 'time';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface Block {
  id: string;
  value: number;
  row: number;
  col: number;
  isRemoving?: boolean;
}

export interface GameState {
  blocks: Block[];
  targetSum: number;
  score: number;
  highScore: number;
  status: GameStatus;
  mode: GameMode;
  timeLeft: number;
  selectedIds: string[];
}
