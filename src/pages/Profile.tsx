import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { User, Trophy, Calendar, Edit3, Save, X, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { getUserStats, getLeaderboard } = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || ''
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  const stats = getUserStats(user.id);
  const recentGames = getLeaderboard().filter(score => score.userId === user.id).slice(0, 10);

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      username: user.username,
      avatar: user.avatar
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={isEditing ? editData.avatar : user.avatar}
                alt={user.username}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20"
              />
              {user.isAdmin && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ADMIN
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="text-3xl font-bold bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="url"
                    value={editData.avatar}
                    onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                    placeholder="Avatar URL"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">{user.email}</p>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Statistics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalGames}</div>
                  <div className="text-gray-300 text-sm">Games Played</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalScore.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">Total Score</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{stats.averageScore}</div>
                  <div className="text-gray-300 text-sm">Average Score</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{stats.bestScore.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">Best Score</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">Favorite Game</h3>
                <p className="text-gray-300 capitalize">{stats.favoriteGame}</p>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Recent Games
              </h2>
              
              {recentGames.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No games played yet</p>
              ) : (
                <div className="space-y-3">
                  {recentGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <div className="text-white font-medium capitalize">{game.gameType}</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(game.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-bold">{game.score}</div>
                        <div className="text-gray-400 text-sm">{Math.round(game.duration / 1000)}s</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;