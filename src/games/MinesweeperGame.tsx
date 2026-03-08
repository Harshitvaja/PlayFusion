import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Clock, Trophy, Flag, Bomb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
type CellState = 'hidden' | 'revealed' | 'flagged';

interface Cell {
  isMine: boolean;
  neighborMines: number;
  state: CellState;
}

interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

const GAME_CONFIGS: Record<Difficulty, GameConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

const MinesweeperGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [startTime, setStartTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  const config = GAME_CONFIGS[difficulty];

  const createEmptyBoard = (): Cell[][] => {
    return Array(config.rows).fill(null).map(() =>
      Array(config.cols).fill(null).map(() => ({
        isMine: false,
        neighborMines: 0,
        state: 'hidden' as CellState
      }))
    );
  };

  const placeMines = (board: Cell[][], firstClickRow: number, firstClickCol: number): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);

      // Don't place mine on first click or if already has mine
      if ((row === firstClickRow && col === firstClickCol) || newBoard[row][col].isMine) {
        continue;
      }

      newBoard[row][col].isMine = true;
      minesPlaced++;
    }

    // Calculate neighbor mine counts
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 && newRow < config.rows &&
                newCol >= 0 && newCol < config.cols &&
                newBoard[newRow][newCol].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    return newBoard;
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setBoard(createEmptyBoard());
    setGameState('playing');
    setStartTime(Date.now());
    setGameTime(0);
    setFlagCount(0);
    setFirstClick(true);
  };

  const revealCell = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    setBoard(prevBoard => {
      let newBoard = prevBoard.map(r => r.map(cell => ({ ...cell })));

      // Handle first click - place mines after first click
      if (firstClick) {
        newBoard = placeMines(newBoard, row, col);
        setFirstClick(false);
      }

      const cell = newBoard[row][col];
      if (cell.state !== 'hidden') return prevBoard;

      // Hit a mine
      if (cell.isMine) {
        // Reveal all mines
        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            if (newBoard[r][c].isMine) {
              newBoard[r][c].state = 'revealed';
            }
          }
        }
        setGameState('lost');
        return newBoard;
      }

      // Reveal cell and potentially cascade
      const toReveal: { row: number; col: number }[] = [{ row, col }];
      const revealed = new Set<string>();

      while (toReveal.length > 0) {
        const { row: currentRow, col: currentCol } = toReveal.pop()!;
        const key = `${currentRow}-${currentCol}`;

        if (revealed.has(key)) continue;
        revealed.add(key);

        const currentCell = newBoard[currentRow][currentCol];
        if (currentCell.state !== 'hidden' || currentCell.isMine) continue;

        currentCell.state = 'revealed';

        // If no neighboring mines, reveal all neighbors
        if (currentCell.neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = currentRow + dr;
              const newCol = currentCol + dc;
              if (
                newRow >= 0 && newRow < config.rows &&
                newCol >= 0 && newCol < config.cols
              ) {
                toReveal.push({ row: newRow, col: newCol });
              }
            }
          }
        }
      }

      // Check for win condition
      let hiddenNonMines = 0;
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (!newBoard[r][c].isMine && newBoard[r][c].state === 'hidden') {
            hiddenNonMines++;
          }
        }
      }

      if (hiddenNonMines === 0) {
        setGameState('won');
        if (user) {
          const duration = Date.now() - startTime;
          const difficultyMultiplier = { beginner: 1, intermediate: 2, expert: 3 }[difficulty];
          const baseScore = 1000 * difficultyMultiplier;
          const timeBonus = Math.max(0, 300 - Math.floor(duration / 1000));
          const flagBonus = Math.max(0, (config.mines - flagCount) * 10);
          const finalScore = baseScore + timeBonus + flagBonus;
          addScore('minesweeper', finalScore, duration);
        }
      }

      return newBoard;
    });
  }, [gameState, firstClick, config, difficulty, startTime, flagCount, user, addScore]);

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(r => r.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (cell.state === 'hidden') {
        cell.state = 'flagged';
        setFlagCount(prev => prev + 1);
      } else if (cell.state === 'flagged') {
        cell.state = 'hidden';
        setFlagCount(prev => prev - 1);
      }

      return newBoard;
    });
  };

  const getCellContent = (cell: Cell): string => {
    if (cell.state === 'flagged') return '🚩';
    if (cell.state === 'hidden') return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines.toString();
  };

  const getCellColor = (cell: Cell): string => {
    if (cell.state === 'hidden') return 'bg-gray-400 hover:bg-gray-300';
    if (cell.state === 'flagged') return 'bg-yellow-400';
    if (cell.isMine) return 'bg-red-500';
    
    const colors = [
      'bg-gray-200', // 0 (empty)
      'text-blue-600', // 1
      'text-green-600', // 2
      'text-red-600', // 3
      'text-purple-600', // 4
      'text-yellow-600', // 5
      'text-pink-600', // 6
      'text-black', // 7
      'text-gray-600' // 8
    ];
    
    return `bg-gray-200 ${colors[cell.neighborMines]}`;
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && !firstClick) {
      const timer = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, firstClick, startTime]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Minesweeper and save your scores</p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/games"
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Minesweeper</h1>
            <p className="text-gray-300">Clear the field without hitting mines</p>
          </div>
          
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center"
          >
            <Bomb className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Choose Difficulty</h2>
            <p className="text-gray-300 mb-8">
              Clear all safe squares without detonating any mines. Right-click to flag suspected mines.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((level) => {
                const config = GAME_CONFIGS[level];
                return (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startGame(level)}
                    className={`p-6 rounded-xl transition-all duration-300 ${
                      level === 'beginner' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                      level === 'intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' :
                      'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                    } text-white`}
                  >
                    <h3 className="text-xl font-bold mb-2 capitalize">{level}</h3>
                    <p className="text-sm opacity-90 mb-2">
                      {config.rows}×{config.cols} grid
                    </p>
                    <p className="text-sm opacity-90">
                      {config.mines} mines
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Game Board */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                {/* Game Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-white">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{Math.floor((gameTime || 0) / 1000)}s</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <Flag className="w-4 h-4" />
                      <span className="font-bold">{config.mines - flagCount}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Difficulty:</span> 
                      <span className={`font-bold ml-1 capitalize ${
                        difficulty === 'beginner' ? 'text-green-400' :
                        difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{difficulty}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startGame(difficulty)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>New Game</span>
                  </button>
                </div>

                {/* Minesweeper Board */}
                <div className="bg-white/5 p-4 rounded-xl overflow-auto">
                  <div 
                    className="grid gap-1 mx-auto"
                    style={{ 
                      gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
                      width: 'fit-content'
                    }}
                  >
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <motion.button
                          key={`${rowIndex}-${colIndex}`}
                          whileHover={{ scale: cell.state === 'hidden' ? 1.05 : 1 }}
                          whileTap={{ scale: cell.state === 'hidden' ? 0.95 : 1 }}
                          onClick={() => revealCell(rowIndex, colIndex)}
                          onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-400 transition-all duration-200 ${getCellColor(cell)}`}
                        >
                          {getCellContent(cell)}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Game State Messages */}
                {gameState === 'won' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-white/10"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                    <p className="text-gray-300 mb-4">
                      You cleared the {difficulty} field in {Math.floor(gameTime / 1000)} seconds!
                    </p>
                    <button
                      onClick={() => startGame(difficulty)}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Play Again
                    </button>
                  </motion.div>
                )}

                {gameState === 'lost' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-white/10"
                  >
                    <Bomb className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
                    <p className="text-gray-300 mb-4">
                      You hit a mine! Better luck next time.
                    </p>
                    <button
                      onClick={() => startGame(difficulty)}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Game Info */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Game Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Grid:</span>
                    <span className="text-white">{config.rows}×{config.cols}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Mines:</span>
                    <span className="text-white">{config.mines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Flags Left:</span>
                    <span className="text-white">{config.mines - flagCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{Math.floor((gameTime || 0) / 1000)}s</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Controls</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Left click: Reveal cell</li>
                  <li>• Right click: Flag/unflag</li>
                  <li>• Numbers show nearby mines</li>
                  <li>• Clear all safe cells to win</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Number Guide</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <div key={num} className={`p-2 bg-white/5 rounded ${
                      num === 1 ? 'text-blue-400' :
                      num === 2 ? 'text-green-400' :
                      num === 3 ? 'text-red-400' :
                      num === 4 ? 'text-purple-400' :
                      num === 5 ? 'text-yellow-400' :
                      num === 6 ? 'text-pink-400' :
                      num === 7 ? 'text-white' : 'text-gray-400'
                    }`}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Start with corners and edges</li>
                  <li>• Use numbers to deduce mine locations</li>
                  <li>• Flag suspected mines</li>
                  <li>• Look for patterns and logic</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MinesweeperGame;