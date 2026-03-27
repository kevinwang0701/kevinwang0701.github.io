/**
 * PassiveSystem.js — 被動道具系統
 * 
 * 管理在畫面上自動運作的輔助道具：
 * - 捕蚊燈：吸引附近蚊子並緩慢消滅
 * - 青蛙：定時伸舌捕捉蚊子
 * 
 * 這些道具透過升級商店購買後放置於畫面上。
 */

export class PassiveSystem {
    /**
     * @param {Game} game - 遊戲主控參考
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        /** @type {Array<PassiveItem>} 已放置的被動道具列表 */
        this.items = [];
    }

    /**
     * 新增被動道具
     * @param {string} type - 道具類型（'mosquito_lamp', 'frog'）
     * @param {number} x - 放置位置 X
     * @param {number} y - 放置位置 Y
     */
    addItem(type, x, y) {
        // TODO: 建立對應的被動道具並加入列表
    }

    /**
     * 每幀更新：讓所有被動道具執行自動行為
     * @param {number} deltaTime
     * @param {Array<Entity>} enemies - 場上敵人列表
     */
    update(deltaTime, enemies) {
        // TODO:
        // 遍歷所有被動道具，各自執行：
        // - 捕蚊燈：偵測範圍內的蚊子，吸引並造成傷害
        // - 青蛙：計時，到時向最近的蚊子伸舌攻擊
    }

    /**
     * 繪製所有被動道具
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO: 遍歷所有道具並繪製
    }

    /**
     * 重置（新遊戲時）
     */
    reset() {
        // TODO: 清空所有道具
    }
}
