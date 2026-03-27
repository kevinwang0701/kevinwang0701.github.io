/**
 * UpgradeShop.js — 升級商店 UI
 * 
 * 波次之間顯示的升級商店畫面：
 * - 顯示所有可購買的升級項目
 * - 顯示目前分數與已有的升級
 * - 購買確認動畫
 * - 「繼續下一波」按鈕
 */

export class UpgradeShop {
    /**
     * @param {Game} game - 遊戲主控參考
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {Array<Object>} 商品卡片列表 */
        this.cards = [];

        /** @type {number} 捲動偏移量 */
        this.scrollOffset = 0;
    }

    /**
     * 初始化商店 UI
     */
    init() {
        // TODO: 建立商品卡片的佈局
    }

    /**
     * 刷新商店內容（開啟時呼叫）
     */
    refresh() {
        // TODO: 從 UpgradeSystem 取得最新的升級列表與價格
    }

    /**
     * 每幀更新（動畫效果）
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO: 更新卡片 hover 效果、購買動畫
    }

    /**
     * 繪製升級商店
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO:
        // 1. 繪製商店背景面板
        // 2. 繪製目前分數
        // 3. 繪製商品卡片（圖示、名稱、描述、價格、等級）
        // 4. 繪製「繼續下一波」按鈕
    }

    /**
     * 處理商店上的點擊
     * @param {number} x
     * @param {number} y
     */
    handleClick(x, y) {
        // TODO:
        // 1. 檢查是否點擊了商品卡片 → 嘗試購買
        // 2. 檢查是否點擊了「繼續」按鈕
    }
}
