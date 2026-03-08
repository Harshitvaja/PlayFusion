import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameScore {
  id: string;
  userId: string;
  username: string;
  gameType: string;
  score: number;
  date: string;
  duration: number;
}

interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  favoriteGame: string;
}

interface GameContextType {
  scores: GameScore[];
  addScore: (gameType: string, score: number, duration: number) => void;
  getLeaderboard: (gameType?: string, timeFilter?: string) => GameScore[];
  getUserStats: (userId: string) => GameStats;
  getGameStats: () => any;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scores, setScores] = useState<GameScore[]>(() => {
    const saved = localStorage.getItem('gameScores');
    return saved ? JSON.parse(saved) : [];
  });

  const addScore = (gameType: string, score: number, duration: number) => {
    const userData = localStorage.getItem('userData');
    if (!userData) return;

    const user = JSON.parse(userData);
    const newScore: GameScore = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      gameType,
      score,
      date: new Date().toISOString(),
      duration
    };

    const updatedScores = [...scores, newScore];
    setScores(updatedScores);
    localStorage.setItem('gameScores', JSON.stringify(updatedScores));

    // Update user stats
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].gamesPlayed = (users[userIndex].gamesPlayed || 0) + 1;
      users[userIndex].totalScore = (users[userIndex].totalScore || 0) + score;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('userData', JSON.stringify(users[userIndex]));
    }
  };

  const getLeaderboard = (gameType?: string, timeFilter?: string) => {
    let filteredScores = scores;

    if (gameType && gameType !== 'all') {
      filteredScores = filteredScores.filter(score => score.gameType === gameType);
    }

    if (timeFilter && timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'day':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filteredScores = filteredScores.filter(score => 
        new Date(score.date) >= filterDate
      );
    }

    return filteredScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  };

  const getUserStats = (userId: string): GameStats => {
    const userScores = scores.filter(score => score.userId === userId);
    const totalGames = userScores.length;
    const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;
    const bestScore = Math.max(...userScores.map(score => score.score), 0);
    
    const gameTypeCounts = userScores.reduce((acc, score) => {
      acc[score.gameType] = (acc[score.gameType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteGame = Object.entries(gameTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalGames,
      totalScore,
      averageScore: Math.round(averageScore),
      bestScore,
      favoriteGame
    };
  };

  const getGameStats = () => {
    const gameTypes = ['tictactoe', 'sudoku', '2048', 'minesweeper', 'chess', 'quiz', 'memory'];
    return gameTypes.map(gameType => {
      const gameScores = scores.filter(score => score.gameType === gameType);
      return {
        name: gameType,
        totalPlays: gameScores.length,
        averageScore: gameScores.length > 0 ? 
          Math.round(gameScores.reduce((sum, score) => sum + score.score, 0) / gameScores.length) : 0,
        bestScore: Math.max(...gameScores.map(score => score.score), 0)
      };
    });
  };

  return (
    <GameContext.Provider value={{
      scores,
      addScore,
      getLeaderboard,
      getUserStats,
      getGameStats
    }}>
      {children}
    </GameContext.Provider>
  );
};