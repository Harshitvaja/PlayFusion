import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Gamepad2, Trophy, Users, TrendingUp, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const { getLeaderboard, scores } = useGame();

  const recentScores = getLeaderboard('all', 'week').slice(0, 5);
  const totalPlayers = new Set(scores.map(score => score.userId)).size;
  const totalGames = scores.length;

  const features = [
    {
      icon: Gamepad2,
      title: 'Multiple Games',
      description: 'Play Snake, Quiz, Memory Games, and more!',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete globally and track your progress',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Social Gaming',
      description: 'Connect with players from around the world',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Statistics',
      description: 'Detailed analytics of your gaming performance',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              PLAY
            </span>
            <span className="text-white">FUSION</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            The ultimate gaming platform featuring classic games, competitive leaderboards, and social features
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/games"
              className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Start Playing</span>
            </Link>
            
            {!user && (
              <Link
                to="/register"
                className="flex items-center space-x-2 px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl transition-all duration-300"
              >
                <Star className="w-5 h-5" />
                <span>Join PLAYFUSION</span>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">{totalGames}</div>
            <div className="text-gray-300">Games Played</div>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-purple-400 mb-2">{totalPlayers}</div>
            <div className="text-gray-300">Active Players</div>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-4xl font-bold text-cyan-400 mb-2">4</div>
            <div className="text-gray-300">Games Available</div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-white mb-12"
        >
          Why Choose PLAYFUSION?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Scores */}
      {recentScores.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="py-16"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-12">Recent High Scores</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {recentScores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== recentScores.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-gray-600'
                    }`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{score.username}</div>
                      <div className="text-gray-400 text-sm capitalize">{score.gameType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{score.score}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(score.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link
                to="/leaderboard"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
              >
                <Trophy className="w-5 h-5" />
              <div className="text-4xl font-bold text-cyan-400 mb-2">7</div>
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;