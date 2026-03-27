/**
 * SpecialMode.js — 特殊模式管理
 * 
 * 管理兩種特殊遊戲模式：
 * 
 * 1. 關燈模式（Darkness Mode）
 *    - 畫面全黑，僅游標周圍有圓形光暈
 *    - 蚊子在黑暗中飛行，玩家靠光暈搜索
 * 
 * 2. 狂熱時間（Frenzy Time）
 *    - Combo 達到閾值時觸發
 *    - 持續一段時間的無敵狀態
 *    - 大量生怪，分數加倍
 */

export class SpecialMode {
    /**
     * @param {Game} game - 遊戲主控參考
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        // ── 關燈模式 ──
        /** @type {boolean} 關燈模式是否啟動 */
        this.isDarknessActive = false;

        /** @type {number} 光暈半徑 */
        this.lightRadius = 150;

        // ── 狂熱時間 ──
        /** @type {boolean} 狂熱時間是否啟動 */
        this.isFrenzyActive = false;

        /** @type {number} 狂熱時間剩餘秒數 */
        this.frenzyTimer = 0;

        /** @type {number} 狂熱時間持續秒數 */
        this.frenzyDuration = 10;

        /** @type {number} 狂熱時間的分數倍率加成 */
        this.frenzyScoreMultiplier = 2.0;
    }

    /**
     * 啟動關燈模式
     */
    activateDarkness() {
        // TODO: isDarknessActive = true
    }

    /**
     * 關閉關燈模式
     */
    deactivateDarkness() {
        // TODO: isDarknessActive = false
    }

    /**
     * 啟動狂熱時間
     */
    activateFrenzy() {
        // TODO:
        // 1. isFrenzyActive = true
        // 2. frenzyTimer = frenzyDuration
        // 3. 通知 WaveManager 增加生怪速度
    }

    /**
     * 每幀更新
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO:
        // 若狂熱時間啟動中：
        // 1. 倒數 frenzyTimer
        // 2. 時間到則結束狂熱時間
    }

    /**
     * 繪製特殊模式效果
     * @param {Renderer} renderer
     * @param {number} cursorX - 游標 X（關燈模式光暈中心）
     * @param {number} cursorY - 游標 Y
     */
    render(renderer, cursorX, cursorY) {
        // TODO:
        // 若關燈模式啟動：呼叫 renderer.drawDarknessOverlay()
        // 若狂熱時間啟動：繪製畫面邊緣的狂熱效果（閃光等）
    }

    /**
     * 重置（新遊戲時）
     */
    reset() {
        // TODO: 關閉所有模式，重置計時器
    }
}
