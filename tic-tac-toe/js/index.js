/**
 * @fileoverview 應用程式進入點。
 * 負責實例化各個模組並將它們組合在一起。
 */
import Store from './Store.js';
import UI from './UI.js';
import Game from './Game.js';

// 確保 DOM 完全載入後再執行
window.addEventListener('DOMContentLoaded', () => {
    // 建立 UI 實例
    const ui = new UI();

    // 建立 Store 實例，並傳入一個回呼函數。
    // 每當狀態改變時，這個回呼函數就會被調用來更新 UI (簡易響應式系統)。
    const store = new Store((updatedStore) => {
        ui.render(updatedStore);
    });
    
    // 建立 Game 實例，它將 Store 和 UI 串連起來
    new Game(store, ui);

    console.log("井字過三關遊戲已成功初始化。");
});