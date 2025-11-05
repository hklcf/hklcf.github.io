/**
 * @fileoverview P2P 網路模組。
 * 遵循單一職責原則，封裝所有 WebRTC (透過 PeerJS) 的複雜性。
 */
export class P2P {
    /**
     * @param {object} callbacks - 用於處理 P2P 事件的回呼函數。
     * @param {(id: string) => void} callbacks.onOpen
     * @param {(conn: any) => void} callbacks.onConnect
     * @param {(data: any) => void} callbacks.onData
     * @param {() => void} callbacks.onClose
     * @param {(err: Error) => void} callbacks.onError
     */
    constructor(callbacks) {
        this.peer = null;
        this.connection = null;
        this.callbacks = callbacks;
    }

    /**
     * 初始化 Peer.js 客戶端並設定事件監聽。
     */
    initialize() {
        try {
            // PeerJS 會自動連線到其公用的 Broker Server 來交換連線資訊。
            // 在生產環境中，建議自行架設 PeerServer。
            this.peer = new Peer();

            this.peer.on('open', this.callbacks.onOpen);
            this.peer.on('connection', (conn) => this.setupConnection(conn));
            this.peer.on('error', this.callbacks.onError);
        } catch (error) {
            console.error("無法初始化 PeerJS:", error);
            this.callbacks.onError(new Error("PeerJS 客戶端初始化失敗。"));
        }
    }

    /**
     * 連線到遠端的 Peer。
     * @param {string} remoteId - 遠端 Peer 的 ID。
     */
    connect(remoteId) {
        if (!this.peer) {
            this.callbacks.onError(new Error("Peer 未初始化。"));
            return;
        }
        try {
            const conn = this.peer.connect(remoteId, { reliable: true });
            this.setupConnection(conn);
        } catch (error) {
            console.error(`連線到 ${remoteId} 失敗:`, error);
            this.callbacks.onError(new Error("連線失敗。"));
        }
    }

    /**
     * 為新的連線設定事件監聽器。
     * @param {import('peerjs').DataConnection} conn - PeerJS 資料連線物件。
     */
    setupConnection(conn) {
        this.connection = conn;
        this.connection.on('open', () => this.callbacks.onConnect(this.connection));
        this.connection.on('data', this.callbacks.onData);
        this.connection.on('close', this.callbacks.onClose);
        this.connection.on('error', this.callbacks.onError);
    }
    
    /**
     * 發送資料到已連線的 Peer。
     * @param {any} data - 要發送的資料。
     */
    send(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        } else {
            console.warn("連線未建立或已關閉，無法發送資料。");
            this.callbacks.onError(new Error("連線已中斷。"));
        }
    }
}