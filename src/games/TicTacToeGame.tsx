import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type Player = 'X' | 'O' | null;
type GameMode = 'pvp' | 'ai';

const TicTacToeGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [startTime, setStartTime] = useState(0);
  const [moveCount, setMoveCount] = useState(0);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (board: Player[]): Player | 'tie' | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return 'tie';
    }
    
    return null;
  };

  const startGame = (mode: GameMode) => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameState('playing');
    setWinner(null);
    setGameMode(mode);
    setStartTime(Date.now());
    setMoveCount(0);
  };

  const makeMove = (index: number) => {
    if (board[index] || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      setGameState('finished');
      
      // Update scores
      if (gameResult === 'tie') {
        setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      } else {
        setScores(prev => ({ ...prev, [gameResult]: prev[gameResult] + 1 }));
      }

      // Add score for user
      if (user && gameResult !== 'tie') {
        const duration = Date.now() - startTime;
        const baseScore = gameResult === 'X' ? 100 : 50; // X wins get more points
        const speedBonus = Math.max(0, 30 - Math.floor(duration / 1000));
        const moveBonus = Math.max(0, 15 - moveCount);
        const finalScore = baseScore + speedBonus + moveBonus;
        addScore('tictactoe', finalScore, duration);
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  // AI move for single player mode
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && gameState === 'playing') {
      const timer = setTimeout(() => {
        // Simple AI: try to win, block player, or make random move
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];
        
        // Try to win
        for (const move of availableMoves) {
          const testBoard = [...board];
          testBoard[move] = 'O';
          if (checkWinner(testBoard) === 'O') {
            makeMove(move);
            return;
          }
        }

        // Try to block player
        for (const move of availableMoves) {
          const testBoard = [...board];
          testBoard[move] = 'X';
          if (checkWinner(testBoard) === 'X') {
            makeMove(move);
            return;
          }
        }

        // Make random move
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          makeMove(randomMove);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameState, gameMode, board]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Tic Tac Toe and save your scores</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Tic Tac Toe</h1>
            <p className="text-gray-300">Classic strategy game</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Choose Game Mode</h2>
            <p className="text-gray-300 mb-8">
              Play the classic game of Tic Tac Toe! Get three in a row to win.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame('pvp')}
                className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl transition-all duration-300"
              >
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">2 Players</h3>
                <p className="text-blue-100">Play with a friend locally</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame('ai')}
                className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300"
              >
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">vs AI</h3>
                <p className="text-green-100">Challenge the computer</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                {/* Game Status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-white">
                    {gameState === 'playing' ? (
                      <span>
                        Current Player: <span className="font-bold text-blue-400">{currentPlayer}</span>
                        {gameMode === 'ai' && currentPlayer === 'O' && ' (AI thinking...)'}
                      </span>
                    ) : (
                      <span className="font-bold">
                        {winner === 'tie' ? 'It\'s a Tie!' : `Player ${winner} Wins!`}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => startGame(gameMode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>New Game</span>
                  </button>
                </div>

                {/* Tic Tac Toe Board */}
                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto bg-white/5 p-4 rounded-xl">
                  {board.map((cell, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: cell ? 1 : 1.05 }}
                      whileTap={{ scale: cell ? 1 : 0.95 }}
                      onClick={() => makeMove(index)}
                      disabled={cell !== null || gameState !== 'playing'}
                      className={`aspect-square bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-4xl font-bold transition-all duration-300 ${
                        cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : 'text-gray-400'
                      } ${
                        cell ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      {cell}
                    </motion.button>
                  ))}
                </div>

                {gameState === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6"
                  >
                    <div className={`text-2xl font-bold mb-4 ${
                      winner === 'X' ? 'text-blue-400' : 
                      winner === 'O' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {winner === 'tie' ? '🤝 It\'s a Tie!' : 
                       winner === 'X' ? '🎉 X Wins!' : '🎉 O Wins!'}
                    </div>
                    <p className="text-gray-300 mb-4">
                      Game completed in {moveCount} moves
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Game Info */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Game Score</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-medium">X Wins:</span>
                    <span className="text-white font-bold">{scores.X}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-medium">O Wins:</span>
                    <span className="text-white font-bold">{scores.O}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-medium">Ties:</span>
                    <span className="text-white font-bold">{scores.ties}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Click any empty square to place your mark</li>
                  <li>• Get 3 in a row (horizontal, vertical, or diagonal)</li>
                  <li>• X always goes first</li>
                  <li>• Block your opponent while building your line</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Game Mode</h3>
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                    gameMode === 'pvp' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {gameMode === 'pvp' ? <Users className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                    <span className="font-medium">
                      {gameMode === 'pvp' ? '2 Players' : 'vs AI'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Control the center square</li>
                  <li>• Watch for opponent's winning moves</li>
                  <li>• Create multiple winning opportunities</li>
                  <li>• Corner squares are strategic</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TicTacToeGame;