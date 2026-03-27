/**
 * Insecticide.js — 殺蟲劑
 * 
 * 繼承自 Weapon，特點：
 * - 全畫面清場攻擊，殺死所有蚊子
 * - 有使用次數限制
 * - 使用時有全螢幕的噴灑動畫效果
 */

import { Weapon } from './Weapon.js?v=2';
import { WEAPON_CONFIG } from '../utils/Constants.js?v=2';

export class Insecticide extends Weapon {
    constructor() {
        super('insecticide', '殺蟲劑');

        const config = WEAPON_CONFIG.INSECTICIDE;
        this.damage = config.DAMAGE;

        /** @type {number} 剩餘使用次數 */
        this.remainingUses = config.MAX_USES;

        /** @type {number} 最大使用次數 */
        this.maxUses = config.MAX_USES;

        /** @type {boolean} 是否正在播放噴灑動畫 */
        this.isAnimating = false;

        /** @type {number} 噴灑動畫計時器 */
        this.animationTimer = 0;

        /** @type {number} 噴灑動畫持續時間（秒） */
        this.animationDuration = 1.5;
    }

    /**
     * 使用殺蟲劑：全螢幕清場
     * @param {number} x - 未使用（全螢幕攻擊）
     * @param {number} y - 未使用
     * @param {Array<Entity>} enemies - 場上所有敵人
     * @returns {Array<Entity>} 被命中的敵人（全部）
     */
    attack(x, y, enemies) {
        // TODO:
        // 1. 檢查 remainingUses > 0
        // 2. 對所有敵人造成傷害（跳過陷阱）
        // 3. remainingUses--
        // 4. 觸發全螢幕噴灑動畫
        // 5. 回傳被消滅的敵人列表
    }

    /**
     * 繪製噴灑效果動畫
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO: 若正在動畫中，繪製全螢幕的霧狀噴灑效果
    }

    /**
     * 增加使用次數（商店購買或獎勵）
     * @param {number} amount
     */
    addUses(amount) {
        // TODO: 增加 remainingUses，不超過 maxUses
    }
}
