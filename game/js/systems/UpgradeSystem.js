/**
 * UpgradeSystem.js — 升級系統
 * 
 * 管理所有可購買的升級項目：
 * - 蒼蠅拍範圍擴大
 * - 電蚊拍電量上限提升
 * - 殺蟲劑次數增加
 * - 其他被動效果
 * 
 * 玩家使用分數進行購買。
 */

export class UpgradeSystem {
    constructor() {
        /** @type {Array<UpgradeItem>} 所有可用的升級項目 */
        this.upgrades = [];
    }

    /**
     * 初始化所有升級項目定義
     */
    init() {
        // TODO: 定義所有升級項目
        // 每個項目包含：id, name, description, cost, maxLevel, effect
        // 例如：
        // { id: 'swatter_range', name: '蒼蠅拍範圍+', cost: 100, maxLevel: 5, ... }
        // { id: 'electric_capacity', name: '電量上限+', cost: 150, maxLevel: 5, ... }
        // { id: 'insecticide_extra', name: '殺蟲劑+1', cost: 200, maxLevel: 3, ... }
    }

    /**
     * 嘗試購買升級
     * @param {string} upgradeId - 升級項目 ID
     * @param {PlayerState} playerState - 玩家狀態
     * @returns {boolean} 是否購買成功
     */
    purchase(upgradeId, playerState) {
        // TODO:
        // 1. 查找升級項目
        // 2. 檢查分數是否足夠
        // 3. 檢查是否已達最大等級
        // 4. 扣除分數、提升等級、套用效果
    }

    /**
     * 取得所有升級項目的目前狀態（供 UI 顯示）
     * @returns {Array<Object>}
     */
    getUpgradeList() {
        // TODO: 回傳包含名稱、描述、費用、目前等級、是否可購買等資訊
    }

    /**
     * 重置所有升級（新遊戲時）
     */
    reset() {
        // TODO: 重置所有升級等級
    }
}
