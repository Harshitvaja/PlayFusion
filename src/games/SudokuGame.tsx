import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Clock, Trophy, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type Difficulty = 'easy' | 'medium' | 'hard';
type CellValue = number | null;

interface SudokuCell {
  value: CellValue;
  isOriginal: boolean;
  isValid: boolean;
}

const SudokuGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [board, setBoard] = useState<SudokuCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [startTime, setStartTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Generate a complete valid Sudoku board
  const generateCompleteBoard = (): number[][] => {
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    
    const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      
      // Check column
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      
      // Check 3x3 box
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      
      return true;
    };

    const solve = (board: number[][]): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(board);
    return board;
  };

  // Remove numbers from complete board based on difficulty
  const createPuzzle = (completeBoard: number[][], difficulty: Difficulty): SudokuCell[][] => {
    const cellsToRemove = {
      easy: 40,
      medium: 50,
      hard: 60
    };

    const puzzle = completeBoard.map(row => 
      row.map(value => ({ value, isOriginal: true, isValid: true }))
    );

    const positions = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push({ row: i, col: j });
      }
    }

    // Shuffle positions
    positions.sort(() => Math.random() - 0.5);

    // Remove cells
    for (let i = 0; i < cellsToRemove[difficulty]; i++) {
      const { row, col } = positions[i];
      puzzle[row][col] = { value: null, isOriginal: false, isValid: true };
    }

    return puzzle;
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    const completeBoard = generateCompleteBoard();
    const puzzle = createPuzzle(completeBoard, selectedDifficulty);
    
    setBoard(puzzle);
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setSelectedCell(null);
    setStartTime(Date.now());
    setGameTime(0);
    setMistakes(0);
    setHintsUsed(0);
  };

  const isValidMove = (board: SudokuCell[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x].value === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && board[x][col].value === num) return false;
    }
    
    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = i + startRow;
        const currentCol = j + startCol;
        if ((currentRow !== row || currentCol !== col) && 
            board[currentRow][currentCol].value === num) {
          return false;
        }
      }
    }
    
    return true;
  };

  const makeMove = (row: number, col: number, num: CellValue) => {
    if (board[row][col].isOriginal) return;

    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    newBoard[row][col].value = num;
    
    if (num !== null) {
      const isValid = isValidMove(newBoard, row, col, num);
      newBoard[row][col].isValid = isValid;
      
      if (!isValid) {
        setMistakes(prev => prev + 1);
      }
    }

    setBoard(newBoard);

    // Check if puzzle is completed
    const isCompleted = newBoard.every(row => 
      row.every(cell => cell.value !== null && cell.isValid)
    );

    if (isCompleted) {
      setGameState('completed');
      if (user) {
        const duration = Date.now() - startTime;
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
        const baseScore = 1000 * difficultyMultiplier;
        const timeBonus = Math.max(0, 600 - Math.floor(duration / 1000));
        const mistakePenalty = mistakes * 50;
        const hintPenalty = hintsUsed * 25;
        const finalScore = Math.max(100, baseScore + timeBonus - mistakePenalty - hintPenalty);
        addScore('sudoku', Math.round(finalScore), duration);
      }
    }
  };

  const getHint = () => {
    if (!selectedCell || hintsUsed >= 3) return;

    const { row, col } = selectedCell;
    if (board[row][col].isOriginal || board[row][col].value !== null) return;

    // Find the correct number for this cell
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(board, row, col, num)) {
        makeMove(row, col, num);
        setHintsUsed(prev => prev + 1);
        break;
      }
    }
  };

  const calculateScore = () => {
    const duration = gameTime || (Date.now() - startTime);
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
    const baseScore = 1000 * difficultyMultiplier;
    const timeBonus = Math.max(0, 600 - Math.floor(duration / 1000));
    const mistakePenalty = mistakes * 50;
    const hintPenalty = hintsUsed * 25;
    return Math.max(100, baseScore + timeBonus - mistakePenalty - hintPenalty);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, startTime]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Sudoku and save your scores</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Sudoku</h1>
            <p className="text-gray-300">Number puzzle challenge</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Choose Difficulty</h2>
            <p className="text-gray-300 mb-8">
              Fill the 9×9 grid so that each column, row, and 3×3 box contains all digits from 1 to 9
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(level)}
                  className={`p-6 rounded-xl transition-all duration-300 ${
                    level === 'easy' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                    level === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' :
                    'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                  } text-white`}
                >
                  <h3 className="text-xl font-bold mb-2 capitalize">{level}</h3>
                  <p className="text-sm opacity-90">
                    {level === 'easy' ? '40 empty cells' :
                     level === 'medium' ? '50 empty cells' :
                     '60 empty cells'}
                  </p>
                </motion.button>
              ))}
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
                    <div className="text-white">
                      <span className="text-gray-400">Mistakes:</span> 
                      <span className="font-bold ml-1 text-red-400">{mistakes}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Hints:</span> 
                      <span className="font-bold ml-1 text-blue-400">{hintsUsed}/3</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={getHint}
                      disabled={!selectedCell || hintsUsed >= 3 || gameState !== 'playing'}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Hint</span>
                    </button>
                    
                    <button
                      onClick={() => startGame(difficulty)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>New Game</span>
                    </button>
                  </div>
                </div>

                {/* Sudoku Board */}
                <div className="bg-white/5 p-4 rounded-xl mx-auto" style={{ width: 'fit-content' }}>
                  <div className="grid grid-cols-9 gap-1 border-2 border-white/30 p-2 rounded">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                        const isInSameBox = selectedCell && 
                          Math.floor(rowIndex / 3) === Math.floor(selectedCell.row / 3) &&
                          Math.floor(colIndex / 3) === Math.floor(selectedCell.col / 3);
                        const isInSameRowOrCol = selectedCell &&
                          (rowIndex === selectedCell.row || colIndex === selectedCell.col);
                        
                        return (
                          <motion.button
                            key={`${rowIndex}-${colIndex}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                            className={`w-12 h-12 flex items-center justify-center text-lg font-bold transition-all duration-200 rounded ${
                              isSelected ? 'bg-blue-500 text-white' :
                              isInSameBox ? 'bg-blue-500/20 text-white' :
                              isInSameRowOrCol ? 'bg-blue-500/10 text-white' :
                              'bg-white/10 hover:bg-white/20 text-white'
                            } ${
                              cell.isOriginal ? 'font-black' : ''
                            } ${
                              !cell.isValid ? 'bg-red-500/30 text-red-300' : ''
                            } ${
                              (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-white/30' : ''
                            } ${
                              (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-white/30' : ''
                            }`}
                          >
                            {cell.value || ''}
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Number Input */}
                {selectedCell && !board[selectedCell.row][selectedCell.col].isOriginal && (
                  <div className="mt-6">
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <motion.button
                          key={num}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => makeMove(selectedCell.row, selectedCell.col, num)}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-200"
                        >
                          {num}
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => makeMove(selectedCell.row, selectedCell.col, null)}
                        className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-all duration-200"
                      >
                        ✕
                      </motion.button>
                    </div>
                  </div>
                )}

                {gameState === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-white/10"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                    <p className="text-gray-300 mb-4">
                      You completed the {difficulty} puzzle in {Math.floor(gameTime / 1000)} seconds!
                    </p>
                    <div className="text-xl font-bold text-green-400">
                      Score: {Math.round(calculateScore())}
                    </div>
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
                    <span className="text-gray-400">Difficulty:</span>
                    <span className={`font-bold capitalize ${
                      difficulty === 'easy' ? 'text-green-400' :
                      difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{Math.floor((gameTime || 0) / 1000)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mistakes:</span>
                    <span className="text-red-400">{mistakes}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Click a cell to select it</li>
                  <li>• Use number buttons to fill cells</li>
                  <li>• Each row, column, and 3×3 box must contain 1-9</li>
                  <li>• Use hints sparingly for better scores</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Start with cells that have fewer possibilities</li>
                  <li>• Look for naked singles</li>
                  <li>• Use elimination technique</li>
                  <li>• Focus on one 3×3 box at a time</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SudokuGame;