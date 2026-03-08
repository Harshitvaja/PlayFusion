import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type Board = (number | null)[][];

const Game2048 = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const initializeBoard = (): Board => {
    return Array(4).fill(null).map(() => Array(4).fill(null));
  };

  const addRandomTile = (board: Board): Board => {
    const emptyCells: { row: number; col: number }[] = [];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return board;

    const newBoard = board.map(row => [...row]);
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    
    return newBoard;
  };

  const startGame = () => {
    let newBoard = initializeBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    
    setBoard(newBoard);
    setScore(0);
    setGameState('playing');
    setStartTime(Date.now());
    setMoveCount(0);
    setHasWon(false);
  };

  const moveLeft = (board: Board): { newBoard: Board; scoreGained: number; moved: boolean } => {
    let scoreGained = 0;
    let moved = false;
    const newBoard = board.map(row => [...row]);

    for (let row = 0; row < 4; row++) {
      const filteredRow = newBoard[row].filter(cell => cell !== null);
      const mergedRow: (number | null)[] = [];
      let i = 0;

      while (i < filteredRow.length) {
        if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
          const mergedValue = filteredRow[i]! * 2;
          mergedRow.push(mergedValue);
          scoreGained += mergedValue;
          i += 2;
        } else {
          mergedRow.push(filteredRow[i]);
          i++;
        }
      }

      while (mergedRow.length < 4) {
        mergedRow.push(null);
      }

      for (let col = 0; col < 4; col++) {
        if (newBoard[row][col] !== mergedRow[col]) {
          moved = true;
        }
        newBoard[row][col] = mergedRow[col];
      }
    }

    return { newBoard, scoreGained, moved };
  };

  const moveRight = (board: Board): { newBoard: Board; scoreGained: number; moved: boolean } => {
    const rotatedBoard = board.map(row => [...row].reverse());
    const { newBoard: movedBoard, scoreGained, moved } = moveLeft(rotatedBoard);
    const finalBoard = movedBoard.map(row => [...row].reverse());
    return { newBoard: finalBoard, scoreGained, moved };
  };

  const moveUp = (board: Board): { newBoard: Board; scoreGained: number; moved: boolean } => {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const { newBoard: movedBoard, scoreGained, moved } = moveLeft(transposedBoard);
    const finalBoard = movedBoard[0].map((_, colIndex) => movedBoard.map(row => row[colIndex]));
    return { newBoard: finalBoard, scoreGained, moved };
  };

  const moveDown = (board: Board): { newBoard: Board; scoreGained: number; moved: boolean } => {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const { newBoard: movedBoard, scoreGained, moved } = moveRight(transposedBoard);
    const finalBoard = movedBoard[0].map((_, colIndex) => movedBoard.map(row => row[colIndex]));
    return { newBoard: finalBoard, scoreGained, moved };
  };

  const canMove = (board: Board): boolean => {
    // Check for empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === null) return true;
      }
    }

    // Check for possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = board[row][col];
        if (
          (col < 3 && current === board[row][col + 1]) ||
          (row < 3 && current === board[row + 1][col])
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const hasWon2048 = (board: Board): boolean => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === 2048) return true;
      }
    }
    return false;
  };

  const makeMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState !== 'playing') return;

    let result;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
    }

    if (!result.moved) return;

    let newBoard = addRandomTile(result.newBoard);
    const newScore = score + result.scoreGained;
    
    setBoard(newBoard);
    setScore(newScore);
    setMoveCount(prev => prev + 1);

    // Update best score
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('2048-best-score', newScore.toString());
    }

    // Check for win condition
    if (!hasWon && hasWon2048(newBoard)) {
      setHasWon(true);
      setGameState('won');
      if (user) {
        const duration = Date.now() - startTime;
        const timeBonus = Math.max(0, 600 - Math.floor(duration / 1000));
        const moveBonus = Math.max(0, 500 - moveCount);
        const finalScore = newScore + timeBonus + moveBonus;
        addScore('2048', finalScore, duration);
      }
    }
    // Check for game over
    else if (!canMove(newBoard)) {
      setGameState('lost');
      if (user) {
        const duration = Date.now() - startTime;
        addScore('2048', newScore, duration);
      }
    }
  }, [board, gameState, score, bestScore, hasWon, startTime, moveCount, user, addScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          makeMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          makeMove('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          makeMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          makeMove('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [makeMove, gameState]);

  const getTileColor = (value: number | null): string => {
    if (!value) return 'bg-white/10';
    
    const colors: { [key: number]: string } = {
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-400 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-purple-500 text-white',
      2048: 'bg-purple-600 text-white',
    };
    
    return colors[value] || 'bg-pink-500 text-white';
  };

  const getTileSize = (value: number | null): string => {
    if (!value) return 'text-2xl';
    if (value >= 1000) return 'text-lg';
    if (value >= 100) return 'text-xl';
    return 'text-2xl';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play 2048 and save your scores</p>
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
        className="max-w-4xl mx-auto"
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
            <h1 className="text-3xl font-bold text-white mb-2">2048</h1>
            <p className="text-gray-300">Slide to combine numbers</p>
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
            <Target className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Play 2048?</h2>
            <p className="text-gray-300 mb-6">
              Slide tiles to combine numbers and reach the 2048 tile! Use arrow keys or WASD to move.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-orange-400 mb-1">2048</div>
                <div className="text-gray-300 text-sm">Goal Tile</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">4×4</div>
                <div className="text-gray-300 text-sm">Grid Size</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">{bestScore}</div>
                <div className="text-gray-300 text-sm">Best Score</div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Game
            </button>
          </motion.div>
        )}

        {gameState !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                {/* Game Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-white">
                      <span className="text-gray-400">Score:</span> 
                      <span className="font-bold ml-1 text-orange-400">{score.toLocaleString()}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Best:</span> 
                      <span className="font-bold ml-1 text-green-400">{bestScore.toLocaleString()}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Moves:</span> 
                      <span className="font-bold ml-1 text-blue-400">{moveCount}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={startGame}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>New Game</span>
                  </button>
                </div>

                {/* 2048 Board */}
                <div className="bg-white/5 p-4 rounded-xl mx-auto" style={{ width: 'fit-content' }}>
                  <div className="grid grid-cols-4 gap-2">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          initial={{ scale: cell ? 0 : 1 }}
                          animate={{ scale: 1 }}
                          className={`w-20 h-20 rounded-lg flex items-center justify-center font-bold transition-all duration-200 ${getTileColor(cell)} ${getTileSize(cell)}`}
                        >
                          {cell || ''}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Game State Messages */}
                {gameState === 'won' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-white/10"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">You Win!</h3>
                    <p className="text-gray-300 mb-4">
                      You reached 2048 in {moveCount} moves!
                    </p>
                    <button
                      onClick={() => setGameState('playing')}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors mr-4"
                    >
                      Continue Playing
                    </button>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      New Game
                    </button>
                  </motion.div>
                )}

                {gameState === 'lost' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-white/10"
                  >
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
                    <p className="text-gray-300 mb-4">
                      Final Score: {score.toLocaleString()}
                    </p>
                    <button
                      onClick={startGame}
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
                <h3 className="text-lg font-semibold text-white mb-3">Controls</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Arrow Keys: Move tiles</li>
                  <li>• WASD: Alternative controls</li>
                  <li>• Combine same numbers</li>
                  <li>• Reach 2048 to win!</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Slide tiles in any direction</li>
                  <li>• When two tiles with the same number touch, they merge</li>
                  <li>• After each move, a new tile appears</li>
                  <li>• Try to reach the 2048 tile!</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Current Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highest Tile:</span>
                    <span className="text-white font-bold">
                      {Math.max(...board.flat().filter(Boolean) as number[]) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Empty Cells:</span>
                    <span className="text-white font-bold">
                      {board.flat().filter(cell => cell === null).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Keep your highest tile in a corner</li>
                  <li>• Build up numbers in one direction</li>
                  <li>• Don't move your highest tile</li>
                  <li>• Plan several moves ahead</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Game2048;