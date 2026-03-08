import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Home, RotateCcw, Crown, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

const INITIAL_BOARD: (ChessPiece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ]
];

const ChessGame = () => {
  const { user } = useAuth();
  const { addScore } = useGame();
  
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'checkmate' | 'stalemate'>('idle');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: ChessPiece[], black: ChessPiece[] }>({
    white: [],
    black: []
  });
  const [startTime, setStartTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);

  const startGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setGameState('playing');
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setStartTime(Date.now());
  };

  const isValidMove = (from: Position, to: Position, piece: ChessPiece): boolean => {
    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);
    const targetPiece = board[to.row][to.col];

    // Can't capture own piece
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    // Basic movement validation for each piece type
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (to.col === from.col) {
          // Forward movement
          if (to.row === from.row + direction && !targetPiece) return true;
          if (from.row === startRow && to.row === from.row + 2 * direction && !targetPiece) return true;
        } else if (dx === 1 && to.row === from.row + direction && targetPiece) {
          // Diagonal capture
          return true;
        }
        return false;

      case 'rook':
        return (dx === 0 || dy === 0) && isPathClear(from, to);

      case 'bishop':
        return dx === dy && isPathClear(from, to);

      case 'queen':
        return (dx === 0 || dy === 0 || dx === dy) && isPathClear(from, to);

      case 'knight':
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

      case 'king':
        return dx <= 1 && dy <= 1;

      default:
        return false;
    }
  };

  const isPathClear = (from: Position, to: Position): boolean => {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    
    let currentRow = from.row + dy;
    let currentCol = from.col + dx;
    
    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += dy;
      currentCol += dx;
    }
    
    return true;
  };

  const makeMove = (from: Position, to: Position) => {
    const piece = board[from.row][from.col];
    if (!piece || piece.color !== currentPlayer) return false;

    if (!isValidMove(from, to, piece)) return false;

    const newBoard = board.map(row => [...row]);
    const capturedPiece = newBoard[to.row][to.col];
    
    // Update captured pieces
    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        [capturedPiece.color]: [...prev[capturedPiece.color], capturedPiece]
      }));
    }

    // Make the move
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    setBoard(newBoard);
    setMoveHistory(prev => [...prev, `${piece.type} ${String.fromCharCode(97 + from.col)}${8 - from.row} to ${String.fromCharCode(97 + to.col)}${8 - to.row}`]);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    
    return true;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;

    const position = { row, col };
    const piece = board[row][col];

    if (selectedSquare) {
      if (selectedSquare.row === row && selectedSquare.col === col) {
        // Deselect
        setSelectedSquare(null);
      } else {
        // Try to make move
        if (makeMove(selectedSquare, position)) {
          setSelectedSquare(null);
        } else if (piece && piece.color === currentPlayer) {
          // Select new piece
          setSelectedSquare(position);
        } else {
          setSelectedSquare(null);
        }
      }
    } else if (piece && piece.color === currentPlayer) {
      // Select piece
      setSelectedSquare(position);
    }
  };

  const calculateScore = () => {
    const duration = gameTime || (Date.now() - startTime);
    const baseScore = 100;
    const moveBonus = Math.max(0, 50 - moveHistory.length);
    const timeBonus = Math.max(0, 300 - Math.floor(duration / 1000));
    const captureBonus = capturedPieces.black.length * 10;
    return baseScore + moveBonus + timeBonus + captureBonus;
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, startTime]);

  // Simple AI move for black (random valid move)
  useEffect(() => {
    if (currentPlayer === 'black' && gameState === 'playing') {
      const timer = setTimeout(() => {
        const blackPieces: { piece: ChessPiece, pos: Position }[] = [];
        
        // Find all black pieces
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === 'black') {
              blackPieces.push({ piece, pos: { row, col } });
            }
          }
        }

        // Try random moves until one is valid
        for (let attempts = 0; attempts < 100; attempts++) {
          const randomPiece = blackPieces[Math.floor(Math.random() * blackPieces.length)];
          const randomRow = Math.floor(Math.random() * 8);
          const randomCol = Math.floor(Math.random() * 8);
          
          if (makeMove(randomPiece.pos, { row: randomRow, col: randomCol })) {
            break;
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameState, board]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to play Chess and save your scores</p>
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
        className="max-w-6xl mx-auto"
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
            <h1 className="text-3xl font-bold text-white mb-2">Chess</h1>
            <p className="text-gray-300">Classic strategy game against AI</p>
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
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready for Chess?</h2>
            <p className="text-gray-300 mb-6">
              Play classic chess against an AI opponent. Use strategy and tactics to checkmate the enemy king!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-yellow-400 mb-1">♔</div>
                <div className="text-gray-300 text-sm">You play as White</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">AI</div>
                <div className="text-gray-300 text-sm">Computer Opponent</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">500</div>
                <div className="text-gray-300 text-sm">Max Score</div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Game
            </button>
          </motion.div>
        )}

        {gameState !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chess Board */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                {/* Game Status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-white">
                      <span className="text-gray-400">Turn:</span> 
                      <span className={`font-bold ml-1 ${currentPlayer === 'white' ? 'text-white' : 'text-gray-400'}`}>
                        {currentPlayer === 'white' ? 'Your Turn' : 'AI Thinking...'}
                      </span>
                    </div>
                    <div className="text-white">
                      <span className="text-gray-400">Moves:</span> 
                      <span className="font-bold ml-1">{moveHistory.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>New Game</span>
                  </button>
                </div>

                {/* Chess Board */}
                <div className="bg-amber-100 p-4 rounded-xl mx-auto" style={{ width: 'fit-content' }}>
                  <div className="grid grid-cols-8 gap-0 border-2 border-amber-800">
                    {board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                        
                        return (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                            className={`w-16 h-16 flex items-center justify-center text-4xl cursor-pointer transition-all duration-200 ${
                              isLight ? 'bg-amber-100' : 'bg-amber-800'
                            } ${
                              isSelected ? 'ring-4 ring-blue-400 ring-inset' : ''
                            } hover:brightness-110`}
                          >
                            {piece && PIECE_SYMBOLS[piece.color][piece.type]}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Game Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {currentPlayer === 'white' ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400">Your Turn</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400">AI Turn</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Time: {Math.floor((gameTime || 0) / 1000)}s
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Captured Pieces</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">You captured:</div>
                    <div className="flex flex-wrap gap-1">
                      {capturedPieces.black.map((piece, index) => (
                        <span key={index} className="text-lg">
                          {PIECE_SYMBOLS.black[piece.type]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">AI captured:</div>
                    <div className="flex flex-wrap gap-1">
                      {capturedPieces.white.map((piece, index) => (
                        <span key={index} className="text-lg">
                          {PIECE_SYMBOLS.white[piece.type]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Click a piece to select it</li>
                  <li>• Click a square to move</li>
                  <li>• Capture enemy pieces</li>
                  <li>• Protect your king</li>
                  <li>• Checkmate to win</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 max-h-48 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-3">Move History</h3>
                <div className="space-y-1 text-sm">
                  {moveHistory.length === 0 ? (
                    <div className="text-gray-400">No moves yet</div>
                  ) : (
                    moveHistory.map((move, index) => (
                      <div key={index} className="text-gray-300">
                        {index + 1}. {move}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Control the center</li>
                  <li>• Develop pieces early</li>
                  <li>• Castle for king safety</li>
                  <li>• Think ahead</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ChessGame;