/**
 * ArmoredMosquito.js — 裝甲蚊
 * 
 * 繼承自 Mosquito，特點：
 * - HP = 3，需要點擊 3 次才能擊殺
 * - 移動速度較慢
 * - 吸血速度較快
 * - 被擊中時有護甲破碎的視覺反饋
 */

import { Mosquito } from './Mosquito.js?v=2';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=2';

export class ArmoredMosquito extends Mosquito {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     */
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.ARMORED_MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** @type {number} 護甲破碎動畫的計時器 */
        this.armorBreakTimer = 0;

        /** @type {boolean} 是否正在播放護甲破碎效果 */
        this.isShowingArmorBreak = false;
    }

    /**
     * 覆寫受傷：觸發護甲破碎視覺效果
     * @param {number} damage
     * @returns {boolean}
     */
    takeDamage(damage) {
        // TODO:
        // 1. 呼叫 super.takeDamage(damage)
        // 2. 觸發護甲破碎動畫
        // 3. 根據剩餘 HP 改變外觀（裝甲逐步剝落）
    }

    /**
     * 覆寫繪製：包含護甲狀態的視覺呈現
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO: 根據剩餘 HP 繪製不同程度的護甲外觀
    }
}
