import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GameCenter from './pages/GameCenter';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import ChessGame from './games/ChessGame';
import QuizGame from './games/QuizGame';
import MemoryGame from './games/MemoryGame';
import TicTacToeGame from './games/TicTacToeGame';
import SudokuGame from './games/SudokuGame';
import Game2048 from './games/Game2048';
import MinesweeperGame from './games/MinesweeperGame';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/games" element={<GameCenter />} />
                <Route path="/games/chess" element={<ChessGame />} />
                <Route path="/games/quiz" element={<QuizGame />} />
                <Route path="/games/memory" element={<MemoryGame />} />
                <Route path="/games/tictactoe" element={<TicTacToeGame />} />
                <Route path="/games/sudoku" element={<SudokuGame />} />
                <Route path="/games/2048" element={<Game2048 />} />
                <Route path="/games/minesweeper" element={<MinesweeperGame />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;