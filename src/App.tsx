/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Timer, 
  Zap, 
  ChevronLeft,
  Info,
  Settings,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLocalStorage } from 'react-use';

import { Block, GameMode, GameStatus, GameState } from './types';
import { 
  GRID_COLS, 
  GRID_ROWS_MAX, 
  INITIAL_ROWS, 
  TIME_LIMIT 
} from './constants';
import { 
  generateInitialBlocks, 
  generateTargetSum, 
  addNewRow, 
  checkGameOver 
} from './utils/gameUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage<number>('sum-merge-highscore', 0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [mode, setMode] = useState<GameMode>('classic');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = (selectedMode: GameMode) => {
    setBlocks(generateInitialBlocks(INITIAL_ROWS));
    setTargetSum(generateTargetSum());
    setScore(0);
    setStatus('playing');
    setMode(selectedMode);
    setTimeLeft(TIME_LIMIT);
    setSelectedIds([]);
  };

  const resetGame = () => {
    setStatus('idle');
    setBlocks([]);
    setSelectedIds([]);
  };

  const handleBlockClick = (id: string) => {
    if (status !== 'playing') return;

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  // Check sum whenever selection changes
  useEffect(() => {
    if (selectedIds.length === 0) return;

    const currentSum = selectedIds.reduce((sum, id) => {
      const block = blocks.find(b => b.id === id);
      return sum + (block?.value || 0);
    }, 0);

    if (currentSum === targetSum) {
      // Success!
      handleSuccess();
    } else if (currentSum > targetSum) {
      // Wrong
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setSelectedIds([]);
      }, 500);
    }
  }, [selectedIds, targetSum, blocks]);

  const handleSuccess = () => {
    const points = selectedIds.length * 10 + (mode === 'time' ? Math.floor(timeLeft) : 0);
    setScore(prev => prev + points);
    
    // Remove blocks
    setBlocks(prev => {
      const remaining = prev.filter(b => !selectedIds.includes(b.id));
      // In classic mode, add a new row after each success
      if (mode === 'classic') {
        const withNewRow = addNewRow(remaining);
        if (checkGameOver(withNewRow, GRID_ROWS_MAX)) {
          setStatus('gameover');
        }
        return withNewRow;
      }
      return remaining;
    });

    setSelectedIds([]);
    setTargetSum(generateTargetSum());
    
    if (mode === 'time') {
      setTimeLeft(TIME_LIMIT);
    }

    if (score + points > (highScore || 0)) {
      setHighScore(score + points);
    }
  };

  // Timer for Time Mode
  useEffect(() => {
    if (status === 'playing' && mode === 'time') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            // Time's up! Add a row
            setBlocks(currentBlocks => {
              const withNewRow = addNewRow(currentBlocks);
              if (checkGameOver(withNewRow, GRID_ROWS_MAX)) {
                setStatus('gameover');
              }
              return withNewRow;
            });
            return TIME_LIMIT;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode]);

  // Game over check for empty grid (unlikely but possible) or overflow
  useEffect(() => {
    if (status === 'playing' && blocks.length === 0) {
      setBlocks(generateInitialBlocks(INITIAL_ROWS));
    }
  }, [blocks, status]);

  useEffect(() => {
    if (status === 'gameover') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-8 max-w-md w-full text-center space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-5xl font-display font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                数字堆叠
              </h1>
              <p className="text-zinc-400 text-sm">点击数字，使它们相加等于目标数字。</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => startGame('classic')}
                className="group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                <div className="text-left">
                  <div className="font-bold text-lg">经典模式</div>
                  <div className="text-xs text-zinc-500">每次成功消除后新增一行</div>
                </div>
                <Zap className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => startGame('time')}
                className="group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                <div className="text-left">
                  <div className="font-bold text-lg">计时模式</div>
                  <div className="text-xs text-zinc-500">在倒计时结束前完成求和</div>
                </div>
                <Timer className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-zinc-500">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-mono">最高分: {highScore}</span>
              </div>
              <button 
                onClick={() => setShowHelp(true)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : status === 'gameover' ? (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 max-w-md w-full text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold text-red-400">游戏结束</h2>
              <p className="text-zinc-400">数字方块堆积到了顶部！</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">最终得分</div>
                <div className="text-3xl font-mono font-bold text-white">{score}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">最高分</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">{highScore}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => startGame(mode)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                再来一局
              </button>
              <button 
                onClick={resetGame}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
              >
                返回主页
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6 w-full max-w-md h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between glass-panel p-4">
              <div className="flex gap-2">
                <button 
                  onClick={resetGame} 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  title="返回主页"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setStatus(prev => prev === 'playing' ? 'paused' : 'playing')} 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  title={status === 'playing' ? '暂停' : '继续'}
                >
                  {status === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">目标数字</span>
                <motion.span 
                  key={targetSum}
                  initial={{ scale: 1.5, color: '#10b981' }}
                  animate={{ scale: 1, color: '#10b981' }}
                  className="text-4xl font-display font-bold"
                >
                  {targetSum}
                </motion.span>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">当前得分</div>
                <div className="text-xl font-mono font-bold">{score}</div>
              </div>
            </div>

            {/* Timer Bar (Time Mode) */}
            {mode === 'time' && (
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            )}

            {/* Game Board */}
            <div className="flex-1 relative glass-panel p-2 overflow-hidden bg-zinc-900/50">
              <div 
                className="grid gap-2 h-full"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_ROWS_MAX}, 1fr)`
                }}
              >
                <AnimatePresence>
                  {blocks.map((block) => (
                    <motion.div
                      key={block.id}
                      layoutId={block.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        gridRowStart: GRID_ROWS_MAX - block.row,
                        gridColumnStart: block.col + 1
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => handleBlockClick(block.id)}
                      className={cn(
                        "number-block border",
                        selectedIds.includes(block.id) 
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300",
                        isWrong && selectedIds.includes(block.id) && "animate-shake bg-red-500 border-red-400"
                      )}
                    >
                      {block.value}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Danger Zone Indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">模式</span>
                  <span className="text-xs font-medium text-emerald-400 capitalize">{mode === 'classic' ? '经典' : '计时'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedIds([])}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                清除选择
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            key="help"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-8 max-w-sm w-full space-y-6 relative"
            >
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold text-white">玩法说明</h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0">1</div>
                    <p>点击数字方块进行累加，达到屏幕顶部的<span className="text-emerald-400 font-bold">目标数字</span>。</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0">2</div>
                    <p>数字无需相邻，可以点击网格中任意位置的方块进行组合。</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0">3</div>
                    <p>不要让方块堆积到<span className="text-red-400 font-bold">顶部</span>，否则游戏结束。</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0">4</div>
                    <p><span className="text-white font-bold">经典模式：</span>消除后新增一行。<br/><span className="text-white font-bold">计时模式：</span>在倒计时结束前完成求和！</p>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold transition-all"
              >
                明白了！
              </button>
            </motion.div>
          </motion.div>
        )}

        {status === 'paused' && (
          <motion.div 
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="text-center space-y-6">
              <h2 className="text-6xl font-display font-bold tracking-tighter text-white">已暂停</h2>
              <button 
                onClick={() => setStatus('playing')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 mx-auto"
              >
                <Play className="w-6 h-6 fill-current" />
                继续游戏
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
