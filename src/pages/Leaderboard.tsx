import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Trophy, Medal, Award, TrendingUp, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { getLeaderboard } = useGame();
  const [selectedGame, setSelectedGame] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const games = [
    { id: 'all', name: 'All Games' },
    { id: 'tictactoe', name: 'Tic Tac Toe' },
    { id: 'sudoku', name: 'Sudoku' },
    { id: '2048', name: '2048' },
    { id: 'minesweeper', name: 'Minesweeper' },
    { id: 'chess', name: 'Chess' },
    { id: 'quiz', name: 'Quiz Challenge' },
    { id: 'memory', name: 'Memory Game' }
  ];

  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' },
    { id: 'day', name: 'Today' }
  ];

  const leaderboard = getLeaderboard(selectedGame, timeFilter);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{position}</span>
          </div>
        );
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            See how you rank against other players
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Game Type
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id} className="bg-gray-800">
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Time Period
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {timeFilters.map((filter) => (
                  <option key={filter.id} value={filter.id} className="bg-gray-800">
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
            <div className="text-gray-300">Total Players</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {leaderboard[0]?.score.toLocaleString() || 0}
            </div>
            <div className="text-gray-300">Highest Score</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {Math.round(leaderboard.reduce((sum, score) => sum + score.score, 0) / leaderboard.length) || 0}
            </div>
            <div className="text-gray-300">Average Score</div>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        >
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Scores Yet</h3>
              <p className="text-gray-300">Be the first to set a score in this category!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + 1 }}
                  className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                    index < 3 ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(index + 1)}
                    </div>
                    
                    {/* Player Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{score.username}</span>
                        {index < 3 && (
                          <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${getRankBadge(index + 1)}`}>
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="capitalize">{score.gameType}</span>
                        <span>•</span>
                        <span>{new Date(score.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.round(score.duration / 1000)}s</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-amber-500' : 'text-blue-400'
                    }`}>
                      {score.score.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination info */}
        {leaderboard.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-6 text-gray-400"
          >
            Showing top {Math.min(leaderboard.length, 50)} results
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;