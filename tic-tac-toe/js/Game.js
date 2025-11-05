/**
 * @fileoverview 核心遊戲邏輯模組 (協調者)。
 * 連接 Store、UI 和 P2P 模組，處理使用者輸入並執行遊戲規則。
 */

import { config } from './config.js';
import { P2P } from './P2P.js';

class Game {
    /**
     * @param {import('./Store.js').default} store - 狀態管理實例。
     * @param {import('./UI.js').default} ui - UI 實例。
     */
    constructor(store, ui) {
        this.store = store;
        this.ui = ui;
        this.p2p = null;

        this.ui.bindEvents({
            onCellClick: this.handleCellClick.bind(this),
            onResetClick: () => this.handleResetClick(true), // true 表示由本地發起
            onLocalModeSelect: this.selectLocalMode.bind(this),
            onP2PModeSelect: this.selectP2PMode.bind(this),
            onConnectClick: this.handleConnectClick.bind(this),
        });
        
        this.ui.render(this.store);
    }

    selectLocalMode() {
        this.store.setGameMode('local');
    }

    selectP2PMode() {
        this.store.setGameMode('p2p');
        if (!this.p2p) {
            this.p2p = new P2P({
                onOpen: (id) => this.store.setPeerInfo({ peerId: id }),
                onConnect: (conn) => {
                    this.store.setConnection('connected', conn.peer, this.store.state.isHost);
                    alert(`成功連線到 ${conn.peer}！`);
                },
                onData: (data) => this.handleDataReceived(data),
                onClose: () => {
                    alert("與對手的連線已中斷。");
                    this.store.setConnection('disconnected');
                },
                onError: (err) => {
                    console.error("P2P Error:", err);
                    alert(`發生錯誤: ${err.message}`);
                    this.store.setConnection('disconnected');
                },
            });
            this.p2p.initialize();
        }
    }

    handleConnectClick(remoteId) {
        this.store.setConnection('connecting', remoteId, true);
        this.p2p.connect(remoteId);
    }
    
    handleCellClick(index) {
        if (this.store.state.gameStatus.isOver || this.store.state.board[index]) return;

        const { gameMode } = this.store.state;

        if (gameMode === 'local') {
            this.store.updateBoard(index);
            this.checkGameStatus();
        } else if (gameMode === 'p2p') {
            const moveData = { type: config.messageTypes.MOVE, index };
            this.p2p.send(moveData);
            
            // 立即更新本地 UI 以獲得更好的使用者體驗 (Optimistic UI)
            this.store.updateBoard(index);
            this.checkGameStatus();
        }
    }
    
    handleResetClick(isInitiator) {
        if (this.store.state.gameMode === 'p2p' && isInitiator) {
            this.p2p.send({ type: config.messageTypes.RESET });
        }
        this.store.reset();
        this.ui.initializeBoard();
        this.ui.render(this.store);
    }

    handleDataReceived(data) {
        console.log("收到資料:", data);
        switch (data.type) {
            case config.messageTypes.MOVE:
                this.store.updateBoard(data.index);
                this.checkGameStatus();
                break;
            case config.messageTypes.RESET:
                alert("對手已重設遊戲。");
                this.handleResetClick(false); // false 表示非發起者
                break;
            default:
                console.warn("收到未知的訊息類型:", data.type);
        }
    }

    checkGameStatus() {
        const board = this.store.state.board;
        
        for (const combination of config.winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                const winner = board[a];
                this.store.setGameOver({ winner, winningCombination: combination });
                return;
            }
        }

        if (!board.includes(null)) {
            this.store.setGameOver({ winner: null, winningCombination: null });
        }
    }
}

export default Game;