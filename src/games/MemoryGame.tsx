import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CARD_ICONS = ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎵', '🎸'];
const GRID_SIZE = 4;

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);

  const initializeGame = () => {
    const shuffledIcons = [...CARD_ICONS, ...CARD_ICONS].sort(() => Math.random() - 0.5);
    const newCards: Card[] = shuffledIcons.map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameState('playing');
    setStartTime(Date.now());
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length >= 2 || 
        cards[cardId].isMatched || 
        cards[cardId].isFlipped ||
        gameState !== 'playing') {
      return;
    }

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(card => card.id === firstId);
      const secondCard = newCards.find(card => card.id === secondId);

      if (firstCard?.icon === secondCard?.icon) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const calculateScore = () => {
    const timeBonus = Math.max(0, 300 - Math.floor(gameTime / 1000)); // Time bonus
    const moveBonus = Math.max(0, 50 - moves); // Move efficiency bonus
    return (matchedPairs * 100) + timeBonus + moveBonus;
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, startTime]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === CARD_ICONS.length && gameState === 'playing') {
      setGameState('finished');
      const finalTime = Date.now() - startTime;
      if (user) {
        addScore('memory', calculateScore(), finalTime);
      }
    }
  }, [matchedPairs, gameState, startTime, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Memory Game and save your scores</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Memory Game</h1>
            <p className="text-gray-300">Match all the pairs to win</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Test Your Memory!</h2>
            <p className="text-gray-300 mb-6">
              Match all 8 pairs of cards by flipping them two at a time. 
              Complete the game quickly and efficiently to maximize your score!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-400 mb-1">8</div>
                <div className="text-gray-300 text-sm">Pairs to Match</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">16</div>
                <div className="text-gray-300 text-sm">Total Cards</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">450</div>
                <div className="text-gray-300 text-sm">Max Score</div>
              </div>
            </div>
            <button
              onClick={initializeGame}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Game
            </button>
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
                    <div className="text-white">
                      <span className="text-gray-400">Moves:</span> <span className="font-bold">{moves}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Pairs:</span> <span className="font-bold">{matchedPairs}/{CARD_ICONS.length}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{Math.floor(gameTime / 1000)}s</span>
                    </div>
                  </div>
                  <button
                    onClick={initializeGame}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </button>
                </div>

                {/* Game Grid */}
                <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                      whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                      onClick={() => flipCard(card.id)}
                      className={`aspect-square rounded-xl cursor-pointer flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                        card.isFlipped || card.isMatched
                          ? card.isMatched
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/20 hover:bg-white/30 text-transparent'
                      }`}
                    >
                      {(card.isFlipped || card.isMatched) ? card.icon : '?'}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Click cards to flip them</li>
                  <li>• Match two identical cards</li>
                  <li>• Find all 8 pairs to win</li>
                  <li>• Fewer moves = higher score</li>
                  <li>• Faster time = bonus points</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Current Score</h3>
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {gameState === 'finished' ? calculateScore() : '---'}
                </div>
                <div className="text-sm text-gray-400">
                  {gameState === 'playing' ? 'Complete the game to see your score' : 'Final Score'}
                </div>
              </div>

              {gameState === 'finished' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-white/10 p-4 text-center"
                >
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-2">Congratulations!</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You completed the game in {moves} moves and {Math.floor(gameTime / 1000)} seconds!
                  </p>
                  <button
                    onClick={initializeGame}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Pro Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Remember card positions</li>
                  <li>• Focus on one area at a time</li>
                  <li>• Use elimination strategy</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MemoryGame;