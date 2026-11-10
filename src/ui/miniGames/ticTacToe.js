// Tic Tac Toe Mini-Game with Realtime Firebase Synchronization
import { soundEngine } from '../../audio.js';

export class TicTacToeGame {
  constructor(containerEl, syncService, roomService) {
    this.container = containerEl;
    this.syncService = syncService;
    this.roomService = roomService;
    this.isOpen = false;

    this.buildDOM();
  }

  buildDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'game-modal hidden';
    this.modal.id = 'modal-tictactoe';

    this.modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <span class="modal-title">🌸 Couple's Tic-Tac-Toe</span>
          <button class="modal-close-btn" id="ttt-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="ttt-status" id="ttt-status">Waiting for game...</div>
        <div class="ttt-grid" id="ttt-grid">
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<button class="ttt-cell" data-index="${i}"></button>`).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn-primary" id="ttt-restart-btn">Play Again</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modal);

    this.statusEl = this.modal.querySelector('#ttt-status');
    this.gridEl = this.modal.querySelector('#ttt-grid');
    this.cells = Array.from(this.modal.querySelectorAll('.ttt-cell'));
    this.restartBtn = this.modal.querySelector('#ttt-restart-btn');
    this.closeBtn = this.modal.querySelector('#ttt-close-btn');

    this.closeBtn.addEventListener('click', () => this.close());
    this.restartBtn.addEventListener('click', () => this.restartGame());

    // Register real-time sync listener
    this.syncService.onTicTacToeUpdated = (state) => {
      if (this.isOpen) {
        this.renderState(state);
      }
    };

    this.cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const idx = parseInt(cell.getAttribute('data-index'), 10);
        this.makeMove(idx);
      });
    });
  }

  open() {
    this.isOpen = true;
    this.modal.classList.remove('hidden');
    soundEngine.playPop();

    // Check if game exists; if not, initialize
    if (!this.syncService.tictactoeState) {
      this.initNewBoard();
    } else {
      this.renderState(this.syncService.tictactoeState);
    }
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add('hidden');
  }

  async initNewBoard() {
    const newState = {
      board: Array(9).fill(''),
      turn: 'X',
      status: 'playing',
      winner: null,
      playerSymbols: {
        slot1: 'X',
        slot2: 'O'
      }
    };

    await this.syncService.updateTicTacToe(newState);
  }

  async restartGame() {
    soundEngine.playPop();
    await this.initNewBoard();
  }

  getMySymbol() {
    return this.roomService.slot === 1 ? 'X' : 'O';
  }

  async makeMove(index) {
    const state = this.syncService.tictactoeState;
    if (!state || state.status !== 'playing') return;

    const mySymbol = this.getMySymbol();
    if (state.turn !== mySymbol) {
      return; // Not my turn
    }

    if (state.board[index] !== '') {
      return; // Already filled
    }

    soundEngine.playPop();
    const newBoard = [...state.board];
    newBoard[index] = mySymbol;

    // Check winner
    const winner = this.checkWinner(newBoard);
    const isFull = newBoard.every(c => c !== '');

    let status = 'playing';
    let winnerSymbol = null;

    if (winner) {
      status = 'ended';
      winnerSymbol = winner;
      soundEngine.playCheer();
    } else if (isFull) {
      status = 'draw';
    }

    const nextTurn = mySymbol === 'X' ? 'O' : 'X';

    const updatedState = {
      ...state,
      board: newBoard,
      turn: nextTurn,
      status,
      winner: winnerSymbol
    };

    await this.syncService.updateTicTacToe(updatedState);
  }

  checkWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  renderState(state) {
    if (!state) return;
    const mySymbol = this.getMySymbol();

    // Render cells
    state.board.forEach((val, idx) => {
      const cell = this.cells[idx];
      cell.textContent = val;
      cell.classList.remove('x-cell', 'o-cell');
      if (val === 'X') cell.classList.add('x-cell');
      if (val === 'O') cell.classList.add('o-cell');
      cell.disabled = val !== '' || state.status !== 'playing' || state.turn !== mySymbol;
    });

    // Render status
    if (state.status === 'playing') {
      if (state.turn === mySymbol) {
        this.statusEl.textContent = `Your turn! You are "${mySymbol}"`;
        this.statusEl.className = 'ttt-status my-turn';
      } else {
        this.statusEl.textContent = `Partner's turn (${state.turn})...`;
        this.statusEl.className = 'ttt-status partner-turn';
      }
    } else if (state.status === 'ended') {
      if (state.winner === mySymbol) {
        this.statusEl.textContent = '🎉 You won! So sweet!';
      } else {
        this.statusEl.textContent = '💖 Your partner won! Good match!';
      }
      this.statusEl.className = 'ttt-status winner';
    } else if (state.status === 'draw') {
      this.statusEl.textContent = "🤝 It's a sweet tie!";
      this.statusEl.className = 'ttt-status draw';
    }
  }
}
