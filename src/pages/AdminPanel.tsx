import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Shield, 
  Users, 
  Gamepad2, 
  BarChart3, 
  Settings,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const { user } = useAuth();
  const { scores, getGameStats } = useGame();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access the admin panel</p>
        </div>
      </div>
    );
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const gameStats = getGameStats();
  const totalUsers = users.length;
  const totalGames = scores.length;
  const activeUsers = new Set(scores.map(score => score.userId)).size;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'games', name: 'Games', icon: Gamepad2 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter((u: any) => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      // Also remove their scores
      const updatedScores = scores.filter(score => score.userId !== userId);
      localStorage.setItem('gameScores', JSON.stringify(updatedScores));
      window.location.reload();
    }
  };

  const toggleUserAdmin = (userId: string) => {
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.location.reload();
  };

  return (
    <div className="min-h-screen py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Manage users, games, and platform analytics
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
        >
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{totalUsers}</div>
                  <div className="text-gray-300">Total Users</div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <UserCheck className="w-8 h-8 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{activeUsers}</div>
                  <div className="text-gray-300">Active Players</div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <Gamepad2 className="w-8 h-8 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{totalGames}</div>
                  <div className="text-gray-300">Games Played</div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <BarChart3 className="w-8 h-8 text-yellow-400 mb-2" />
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-gray-300">Available Games</div>
                </div>
              </div>

              {/* Game Statistics */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Game Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameStats.map((game: any) => (
                    <div key={game.name} className="bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium capitalize">{game.name}</span>
                        <span className="text-blue-400 font-bold">{game.totalPlays}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Avg Score: {game.averageScore} | Best: {game.bestScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
              
              <div className="space-y-4">
                {users.map((userData: any) => (
                  <div key={userData.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={userData.avatar}
                          alt={userData.username}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold">{userData.username}</span>
                            {userData.isAdmin && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-sm">{userData.email}</div>
                          <div className="text-gray-500 text-xs">
                            Joined: {new Date(userData.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleUserAdmin(userData.id)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            userData.isAdmin
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {userData.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        {userData.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(userData.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Game Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameStats.map((game: any) => (
                  <div key={game.name} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white capitalize">{game.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-500/20 rounded transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Plays:</span>
                        <span className="text-white">{game.totalPlays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Score:</span>
                        <span className="text-white">{game.averageScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Score:</span>
                        <span className="text-white">{game.bestScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Platform Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Data Management</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Manage platform data and reset options. Use with caution.
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all game scores?')) {
                          localStorage.setItem('gameScores', '[]');
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Clear All Scores
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all user data? This cannot be undone.')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Reset Platform
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Storage Used:</span>
                      <span className="text-white ml-2">
                        {Math.round(JSON.stringify(localStorage).length / 1024)}KB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Reset:</span>
                      <span className="text-white ml-2">Never</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;