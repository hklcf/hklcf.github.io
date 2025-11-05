/**
 * @fileoverview 遊戲的外部設定。
 * 將設定值集中管理，便於未來修改和擴展，符合高可配置性原則。
 */

export const config = {
    playerSymbols: {
        P1: 'X',
        P2: 'O',
    },
    winningCombinations: [
        // Rows
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Columns
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonals
        [0, 4, 8],
        [2, 4, 6],
    ],
    // 定義通訊協定類型，使網路訊息的意圖清晰明瞭，避免使用魔法字串
    messageTypes: {
        MOVE: 'MOVE',
        RESET: 'RESET',
    },
};