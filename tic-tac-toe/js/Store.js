/**
 * @fileoverview 狀態管理模組。
 * 遵循單一職責原則 (SRP)，此模組專門負責管理和更新應用程式的狀態 (Single Source of Truth)。
 */

import { config } from './config.js';

class Store {
    /**
     * @param {function(Store): void} [onStateChange=() => {}] - 狀態改變時的回呼函數。
     */
    constructor(onStateChange = () => {}) {
        this._state = this.getInitialState();
        this.onStateChange = onStateChange;
    }

    /**
     * 獲取初始狀態。
     * @returns {object} 初始狀態物件。
     */
    getInitialState() {
        return {
            // 遊戲核心狀態
            board: Array(9).fill(null),
            currentPlayer: config.playerSymbols.P1,
            gameStatus: {
                isOver: false,
                winner: null,
                isDraw: false,
                winningCombination: null,
            },
            // P2P 相關狀態
            gameMode: null, // 'local' | 'p2p'
            peerId: null,
            remotePeerId: null,
            isHost: false, // 主動發起連線者為 Host
            connectionStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
        };
    }

    /**
     * 獲取當前狀態。
     * @returns {object} 當前的狀態。
     */
    get state() {
        return this._state;
    }
    
    /**
     * 更新棋盤並切換玩家。
     * @param {number} index - 格子索引。
     */
    updateBoard(index) {
        if (this._state.board[index] || this._state.gameStatus.isOver) {
            return;
        }
        
        this._state.board[index] = this._state.currentPlayer;
        this._state.currentPlayer = this._state.currentPlayer === config.playerSymbols.P1 
            ? config.playerSymbols.P2 
            : config.playerSymbols.P1;

        this.onStateChange(this);
    }

    /**
     * 更新遊戲結束狀態。
     * @param {{winner: string|null, winningCombination: number[]|null}} result - 遊戲結果。
     */
    setGameOver(result) {
        this._state.gameStatus.isOver = true;
        if (result.winner) {
            this._state.gameStatus.winner = result.winner;
            this._state.gameStatus.winningCombination = result.winningCombination;
        } else {
            this._state.gameStatus.isDraw = true;
        }
        this.onStateChange(this);
    }

    /**
     * 重設遊戲狀態，但保留網路連線狀態。
     */
    reset() {
        const initialState = this.getInitialState();
        this._state.board = initialState.board;
        this._state.currentPlayer = initialState.currentPlayer;
        this._state.gameStatus = initialState.gameStatus;
        this.onStateChange(this);
    }
    
    /**
     * 設定遊戲模式。
     * @param {'local' | 'p2p'} mode - 遊戲模式。
     */
    setGameMode(mode) {
        this._state.gameMode = mode;
        this.onStateChange(this);
    }

    /**
     * 設定本地 Peer ID。
     * @param {{peerId: string}} peerInfo - Peer 資訊。
     */
    setPeerInfo({ peerId }) {
        this._state.peerId = peerId;
        this.onStateChange(this);
    }
    
    /**
     * 設定 P2P 連線狀態。
     * @param {'disconnected' | 'connecting' | 'connected'} status - 連線狀態。
     * @param {string|null} [remotePeerId=null] - 遠端 Peer ID。
     * @param {boolean} [isHost=false] - 是否為主動連線方。
     */
    setConnection(status, remotePeerId = null, isHost = false) {
        this._state.connectionStatus = status;
        this._state.remotePeerId = remotePeerId;
        this._state.isHost = isHost;

        if (status === 'connected') {
            this._state.currentPlayer = config.playerSymbols.P1;
        }

        this.onStateChange(this);
    }
}

export default Store;