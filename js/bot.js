import { game, board, checkGameStatus } from './game.js'; // Import the game object

const pawnValue = 1;
const knightValue = 3;
const bishopValue = 3;
const rookValue = 5;
const queenValue = 9;

// Value table for pieces
const pieceValue = {
  'p': pawnValue,
  'n': knightValue,
  'b': bishopValue,
  'r': rookValue,
  'q': queenValue,
  'P': -pawnValue,
  'N': -knightValue,
  'B': -bishopValue,
  'R': -rookValue,
  'Q': -queenValue,
};

function move_bot() {
  const possibleMoves = game.moves();
  if (possibleMoves.length === 0) return;
  const result = SearchForBestMove(4, -Infinity, Infinity); // Search for the best move with depth 4, initial alpha and beta values
  console.log(result);
  game.move(result.bestMove);

  checkGameStatus();
  board.position(game.fen());
}

function SearchForBestMove(depth, alpha, beta) {
  if (depth === 0) return { evaluation: EvaluatePosition(), bestMove: null };

  const possibleMoves = game.moves();

  if (possibleMoves.length === 0) {
    if (game.in_checkmate()) return { evaluation: -Infinity, bestMove: null };
    return { evaluation: 0, bestMove: null };
  }

  let bestMove = null;
  let bestEvaluation = -Infinity;

  for (const move of possibleMoves) {
    game.move(move);
    const { evaluation } = SearchForBestMove(depth - 1, -beta, -alpha); // Negate beta and alpha for minimax
    const currentEvaluation = -evaluation;

    game.undo();

    if (currentEvaluation > bestEvaluation) {
      bestEvaluation = currentEvaluation;
      bestMove = move;
    }

    if (currentEvaluation > alpha) {
      alpha = currentEvaluation;
    }

    if (alpha >= beta) {
      // Beta cutoff
      break;
    }
  }

  // If no move gives material advantage, prioritize development
  if (bestEvaluation <= 0 && depth > 0) {
    bestMove = prioritizeDevelopment(possibleMoves);
  }

  return { evaluation: alpha, bestMove };
}

function prioritizeDevelopment(moves) {
  const developmentMoves = moves.filter(move => {
    const fromSquare = move.substring(0, 2);
    const piece = game.get(fromSquare);
    if (!piece) return false;
    if (piece.type === 'n' || piece.type === 'b') return true;
    return false;
  });

  if (developmentMoves.length > 0) {
    return developmentMoves[Math.floor(Math.random() * developmentMoves.length)];
  }

  return moves[Math.floor(Math.random() * moves.length)]; // If no development moves, return a random move
}

const EvaluatePosition = () => {
  let evaluation = 0;
  const board = game.board();

  board.forEach((row, rank) => {
    row.forEach((piece, file) => {
      if (piece) {
        const pieceValue = getValue(piece.type, piece.color);
        evaluation += piece.color === 'w' ? pieceValue : -pieceValue;
      }
    });
  });

  const perspective = game.turn() === 'w' ? 1 : -1;

  if (game.in_checkmate()) {
    return perspective * -Infinity;
  }

  if (game.in_draw()) {
    return 0; // Draw is considered as neutral (0 evaluation)
  }

  return perspective * evaluation;
};

function getValue(type, color) {
  switch (type) {
    case 'p':
      return pawnValue;
    case 'n':
      return knightValue;
    case 'b':
      return bishopValue;
    case 'r':
      return rookValue;
    case 'q':
      return queenValue;
    default:
      return 0;
  }
}

export { move_bot };
