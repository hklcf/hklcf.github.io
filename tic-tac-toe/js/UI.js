/**
 * @fileoverview UI 模組。
 * 遵循單一職責原則 (SRP)，此模組專門負責所有與 DOM 相關的操作。
 */

class UI {
    constructor() {
        this.elements = {
            board: document.querySelector('[data-testid="board"]'),
            gameStatus: document.querySelector('[data-testid="game-status"]'),
            resetButton: document.querySelector('[data-testid="reset-button"]'),
            // P2P 相關元素
            modal: document.querySelector('[data-testid="modal"]'),
            localModeBtn: document.querySelector('[data-testid="local-mode-btn"]'),
            p2pModeBtn: document.querySelector('[data-testid="p2p-mode-btn"]'),
            p2pMenu: document.querySelector('[data-testid="p2p-menu"]'),
            playerId: document.querySelector('[data-testid="player-id"]'),
            remoteIdInput: document.querySelector('[data-testid="remote-id-input"]'),
            connectBtn: document.querySelector('[data-testid="connect-btn"]'),
            p2pStatus: document.querySelector('[data-testid="p2p-status"]'),
        };
        this.initializeBoard();
    }
    
    /**
     * 初始化棋盤，創建 9 個格子。
     */
    initializeBoard() {
        this.elements.board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            cell.dataset.index = i;
            this.elements.board.appendChild(cell);
        }
    }

    /**
     * 根據 Store 的狀態渲染整個 UI。
     * @param {import('./Store.js').default} store - 狀態管理實例。
     */
    render(store) {
        const { gameMode, connectionStatus, peerId } = store.state;

        if (!gameMode) {
            this.elements.modal.classList.remove('hidden');
        } else {
            this.elements.modal.classList.add('hidden');
        }

        if (peerId) {
            this.elements.playerId.textContent = peerId;
        }

        this.renderP2PStatus(store);
        this.renderBoardAndStatus(store);
    }

    /**
     * 渲染 P2P 連線狀態訊息。
     * @param {import('./Store.js').default} store - 狀態管理實例。
     */
    renderP2PStatus(store) {
        const { connectionStatus, remotePeerId } = store.state;
        const statusEl = this.elements.p2pStatus;
        
        switch (connectionStatus) {
            case 'connecting':
                statusEl.textContent = `正在連線到 ${this.elements.remoteIdInput.value}...`;
                break;
            case 'connected':
                statusEl.textContent = `已連線到 ${remotePeerId}！`;
                setTimeout(() => this.elements.modal.classList.add('hidden'), 1000);
                break;
            case 'disconnected':
                statusEl.textContent = '已斷線或尚未連線。';
                break;
        }
    }
    
    /**
     * 渲染棋盤和遊戲狀態。
     * @param {import('./Store.js').default} store - 狀態管理實例。
     */
    renderBoardAndStatus(store) {
        const { board, currentPlayer, gameStatus, gameMode, isHost } = store.state;

        board.forEach((symbol, index) => {
            const cell = this.elements.board.children[index];
            if (symbol) {
                cell.textContent = symbol;
                cell.classList.add(symbol.toLowerCase());
            } else {
                cell.textContent = '';
                cell.classList.remove('x', 'o', 'win');
            }
        });

        if (gameStatus.isOver) {
            if (gameStatus.winner) {
                this.elements.gameStatus.textContent = `玩家 ${gameStatus.winner} 獲勝！`;
                this.highlightWinningCells(gameStatus.winningCombination);
            } else if (gameStatus.isDraw) {
                this.elements.gameStatus.textContent = '平手！';
            }
        } else {
            this.elements.gameStatus.textContent = `輪到玩家 ${currentPlayer}`;
        }
        
        if (gameMode === 'p2p' && !gameStatus.isOver) {
            const mySymbol = isHost ? 'X' : 'O';
            if (currentPlayer === mySymbol) {
                this.elements.board.classList.remove('disabled');
            } else {
                this.elements.board.classList.add('disabled');
            }
        } else {
             this.elements.board.classList.remove('disabled');
        }
    }

    /**
     * 高亮顯示獲勝的格子。
     * @param {number[]} winningCombination - 包含獲勝格子索引的陣列。
     */
    highlightWinningCells(winningCombination) {
        if (!winningCombination) return;
        winningCombination.forEach(index => {
            this.elements.board.children[index].classList.add('win');
        });
    }

    /**
     * 綁定所有 UI 事件監聽器。
     * @param {object} handlers - 包含所有事件處理函數的物件。
     */
    bindEvents(handlers) {
        this.elements.board.addEventListener('click', (event) => {
            const clickedCell = event.target.closest('.cell');
            if (clickedCell) {
                try {
                    const index = parseInt(clickedCell.dataset.index, 10);
                    handlers.onCellClick(index);
                } catch (error) {
                    console.error("處理格子點擊時發生錯誤:", error);
                }
            }
        });
        
        this.elements.resetButton.addEventListener('click', handlers.onResetClick);
        this.elements.localModeBtn.addEventListener('click', handlers.onLocalModeSelect);
        
        this.elements.p2pModeBtn.addEventListener('click', () => {
            handlers.onP2PModeSelect();
            this.elements.p2pMenu.classList.remove('hidden');
        });
        
        this.elements.connectBtn.addEventListener('click', () => {
            const remoteId = this.elements.remoteIdInput.value.trim();
            if (remoteId) {
                handlers.onConnectClick(remoteId);
            } else {
                alert("請輸入對手的ID。");
            }
        });
    }
}

export default UI;