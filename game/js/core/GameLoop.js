/**
 * GameLoop.js — 遊戲主迴圈
 *
 * 封裝 requestAnimationFrame，穩定 deltaTime，防止切頁巨大跳幀。
 */

export class GameLoop {
    /**
     * @param {Function} updateCallback - 每幀更新，接收 deltaTime (秒)
     * @param {Function} renderCallback - 每幀繪圖
     */
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;

        this.lastTimestamp = 0;
        this.rafId = null;
        this.isRunning = false;
        this.currentFPS = 0;

        // deltaTime 上限（避免切分頁後巨大跳幀）
        this.maxDeltaTime = 1 / 15; // 最多算 ~66ms

        // FPS 計算用
        this._frameCount = 0;
        this._fpsTimer = 0;

        // 綁定 this，避免 RAF callback 中 this 丟失
        this._loop = this._loop.bind(this);
    }

    /** 啟動遊戲迴圈 */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.rafId = requestAnimationFrame(this._loop);
    }

    /** 停止遊戲迴圈 */
    stop() {
        this.isRunning = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * 內部迴圈
     * @param {DOMHighResTimeStamp} timestamp
     * @private
     */
    _loop(timestamp) {
        if (!this.isRunning) return;

        // 計算 deltaTime（秒）
        let deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // 第一幀或異常值保護
        if (deltaTime < 0 || deltaTime > 1) {
            deltaTime = 1 / 60;
        }

        // 鉗制 deltaTime 防止巨大跳幀
        if (deltaTime > this.maxDeltaTime) {
            deltaTime = this.maxDeltaTime;
        }

        // FPS 計算
        this._frameCount++;
        this._fpsTimer += deltaTime;
        if (this._fpsTimer >= 1.0) {
            this.currentFPS = this._frameCount;
            this._frameCount = 0;
            this._fpsTimer -= 1.0;
        }

        // 更新 → 繪圖（帶錯誤保護避免整個迴圈崩潰）
        try {
            this.updateCallback(deltaTime);
            this.renderCallback();
        } catch (err) {
            console.error('🚨 GameLoop error:', err);
        }

        // 下一幀
        this.rafId = requestAnimationFrame(this._loop);
    }
}
