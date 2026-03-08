import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Gamepad2, 
  Play, 
  Trophy, 
  Clock,
  Crown,
  Brain,
  Eye,
  Grid3X3,
  Hash,
  Calculator,
  Bomb
} from 'lucide-react';
import { motion } from 'framer-motion';

const GameCenter = () => {
  const { user } = useAuth();
  const { getLeaderboard } = useGame();

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic 2-player strategy game with X\'s and O\'s',
      icon: Grid3X3,
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Easy',
      players: '2 Players',
      category: 'Strategy'
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      description: 'Number puzzle with multiple difficulty levels and timer',
      icon: Hash,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Medium',
      players: 'Solo',
      category: 'Puzzle'
    },
    {
      id: '2048',
      name: '2048',
      description: 'Slide numbers to reach the 2048 tile and beyond',
      icon: Calculator,
      color: 'from-orange-500 to-red-600',
      difficulty: 'Medium',
      players: 'Solo',
      category: 'Puzzle'
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      description: 'Uncover all safe squares while avoiding hidden mines',
      icon: Bomb,
      color: 'from-gray-500 to-slate-600',
      difficulty: 'Hard',
      players: 'Solo',
      category: 'Logic'
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'Classic chess game with AI opponent and move validation',
      icon: Crown,
      color: 'from-amber-500 to-yellow-600',
      difficulty: 'Hard',
      players: 'Solo',
      category: 'Strategy'
    },
    {
      id: 'quiz',
      name: 'Quiz Challenge',
      description: 'Test your knowledge across various topics and categories',
      icon: Brain,
      color: 'from-blue-500 to-cyan-600',
      difficulty: 'Easy',
      players: 'Solo',
      category: 'Trivia'
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Challenge your memory with this card matching game',
      icon: Eye,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Medium',
      players: 'Solo',
      category: 'Puzzle'
    }
  ];

  const getGameStats = (gameId: string) => {
    const gameScores = getLeaderboard(gameId).slice(0, 3);
    const totalPlays = getLeaderboard(gameId).length;
    return { gameScores, totalPlays };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to access the game center and track your scores</p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300"
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
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Game Center
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Choose from our collection of engaging games. Track your scores and compete with players worldwide!
          </motion.p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((game, index) => {
            const { gameScores, totalPlays } = getGameStats(game.id);
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group"
              >
                {/* Game Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <game.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-white/10 rounded">{game.category}</span>
                        <span className="px-2 py-1 bg-white/10 rounded">{game.difficulty}</span>
                        <span className="px-2 py-1 bg-white/10 rounded">{game.players}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/games/${game.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 transform group-hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </Link>
                </div>

                {/* Game Description */}
                <p className="text-gray-300 mb-6">{game.description}</p>

                {/* Game Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{totalPlays} total plays</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Best: {gameScores[0]?.score || 0}</span>
                  </div>
                </div>

                {/* Top Players */}
                {gameScores.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Top Players</h4>
                    <div className="space-y-2">
                      {gameScores.slice(0, 3).map((score, idx) => (
                        <div key={score.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-500' : 
                              idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-white">{score.username}</span>
                          </div>
                          <span className="text-blue-400 font-medium">{score.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h2>
          <p className="text-gray-300 mb-6">
            Track your progress, climb the leaderboards, and become a PLAYFUSION champion!
          </p>
          <Link
            to="/leaderboard"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
          >
            <Trophy className="w-5 h-5" />
            <span>View Leaderboard</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameCenter;