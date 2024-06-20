import { game, board, checkGameStatus } from './game.js'; // Import the game object

const pawnValue = 100;
const knightValue = 300;
const bishopValue = 325;
const rookValue = 500;
const queenValue = 900;

let computations = 0;

function move_bot() {
  console.log(game);
  const possibleMoves = game.moves();
  if (possibleMoves.length === 0) return;

  console.time('Total search time');
  const result = SearchForBestMove(3);
  console.timeEnd('Total search time');
  
  console.log(`Total computations: ${computations}`);
  computations = 0;
  console.log('Best move found:', result);

  // game.move(result.bestMove);

  checkGameStatus();
  board.position(game.fen());
}

function SearchForBestMove(depth) {
  if (depth === 0) {
    return EvaluatePosition();
  }

  const possibleMoves = game.moves();

  if (possibleMoves.length === 0) {
    if (game.in_checkmate()) {
      return -Infinity;
    }
    return 0;
  }

  let bestEvaluation = -Infinity;

  for (const move of possibleMoves) {
    game.move(move);
    const evaluation = -SearchForBestMove(depth - 1);
    bestEvaluation = Math.max(bestEvaluation, evaluation);
    game.undo();
  }

  return bestEvaluation;
}

const EvaluatePosition = () => {
  const whiteMaterial = CountMaterial('w', game);
  const blackMaterial = CountMaterial('b', game);

  const evaluation = whiteMaterial - blackMaterial;
  const perspective = game.turn() === 'w' ? 1 : -1;

  return evaluation * perspective;
};

function CountMaterial(color, game) {
  const fen = game.fen();
  const pieces = fen.split(' ')[0];
  let materialCount = 0;

  const pieceValues = {
      'p': pawnValue,
      'n': knightValue,
      'b': bishopValue,
      'r': rookValue,
      'q': queenValue,
      'P': pawnValue,
      'N': knightValue,
      'B': bishopValue,
      'R': rookValue,
      'Q': queenValue
  };

  for (const char of pieces) {
    computations++;
      if (char in pieceValues) {
          if (color === 'w' && char === char.toUpperCase()) {
              materialCount += pieceValues[char];
          } else if (color === 'b' && char === char.toLowerCase()) {
              materialCount += pieceValues[char];
          }
      }
  }

  return materialCount;
}

export { move_bot };
