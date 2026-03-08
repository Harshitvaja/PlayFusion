import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QUESTIONS = [
  {
    question: "What is the capital of Japan?",
    options: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"],
    correct: 0
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correct: 1
  },
  {
    question: "In what year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correct: 1
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2
  },
  {
    question: "Which country invented pizza?",
    options: ["France", "Spain", "Italy", "Greece"],
    correct: 2
  },
  {
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Tiger"],
    correct: 1
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Nauru", "Vatican City", "San Marino"],
    correct: 2
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Osmium", "Oxygen", "Oganesson", "Olivine"],
    correct: 1
  }
];

const QuizGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);

  const startGame = () => {
    // Shuffle questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(15);
    setAnswers([]);
    setSelectedAnswer(null);
    setStartTime(Date.now());
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    setAnswers(prev => [...prev, isCorrect]);
    
    if (isCorrect) {
      setScore(prev => prev + 10 + timeLeft); // Bonus points for speed
    }

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState('finished');
    if (user && score > 0) {
      const duration = Date.now() - startTime;
      addScore('quiz', score, duration);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      // Time's up
      setAnswers(prev => [...prev, false]);
      setTimeout(nextQuestion, 1000);
    }
  }, [timeLeft, gameState, selectedAnswer]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Quiz and save your scores</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Challenge</h1>
            <p className="text-gray-300">Test your knowledge across various topics</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Ready for the Challenge?</h2>
            <p className="text-gray-300 mb-6">
              Answer 10 questions across various topics. You have 15 seconds per question.
              Speed bonus points are awarded for quick correct answers!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">10</div>
                <div className="text-gray-300 text-sm">Questions</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">15s</div>
                <div className="text-gray-300 text-sm">Per Question</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-400 mb-1">25</div>
                <div className="text-gray-300 text-sm">Max Points</div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Quiz
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && questions.length > 0 && (
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
          >
            {/* Progress and Timer */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-white">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-white font-bold">Score: {score}</div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeLeft <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-8">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => selectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedAnswer === null
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                      : selectedAnswer === index
                      ? index === questions[currentQuestion].correct
                        ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                        : 'bg-red-500/30 text-red-400 border border-red-500/50'
                      : index === questions[currentQuestion].correct
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {selectedAnswer !== null && (
                      <>
                        {index === questions[currentQuestion].correct && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {selectedAnswer === index && index !== questions[currentQuestion].correct && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Time's up message */}
            {timeLeft === 0 && selectedAnswer === null && (
              <div className="text-center mt-6">
                <div className="text-red-400 font-semibold">Time's up!</div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
            
            {/* Final Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 p-6 rounded-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">{score}</div>
                <div className="text-gray-300">Final Score</div>
              </div>
              <div className="bg-white/5 p-6 rounded-xl">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {answers.filter(Boolean).length}/{answers.length}
                </div>
                <div className="text-gray-300">Correct Answers</div>
              </div>
              <div className="bg-white/5 p-6 rounded-xl">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {Math.round((answers.filter(Boolean).length / answers.length) * 100)}%
                </div>
                <div className="text-gray-300">Accuracy</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mb-8">
              {answers.filter(Boolean).length >= 8 ? (
                <div className="text-green-400 text-lg font-semibold">Excellent work! 🎉</div>
              ) : answers.filter(Boolean).length >= 6 ? (
                <div className="text-blue-400 text-lg font-semibold">Good job! 👍</div>
              ) : answers.filter(Boolean).length >= 4 ? (
                <div className="text-yellow-400 text-lg font-semibold">Not bad! Keep practicing! 📚</div>
              ) : (
                <div className="text-red-400 text-lg font-semibold">Better luck next time! 💪</div>
              )}
            </div>

            <button
              onClick={startGame}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizGame;