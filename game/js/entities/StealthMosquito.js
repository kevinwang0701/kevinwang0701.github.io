/**
 * StealthMosquito.js — 隱形蚊
 * 
 * 繼承自 Mosquito，特點：
 * - 靜止（吸血）時逐漸變透明
 * - 移動時才顯形
 * - 需要觀察微妙的視覺線索來發現牠
 */

import { Mosquito } from './Mosquito.js?v=2';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=2';

export class StealthMosquito extends Mosquito {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     */
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.STEALTH_MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** @type {number} 目前透明度 (0=完全隱形, 1=完全顯形) */
        this.alpha = 1.0;

        /** @type {number} 透明度變化速率 */
        this.fadeSpeed = 0.5;

        /** @type {number} 最低透明度（不會完全消失，留有微弱痕跡） */
        this.minAlpha = 0.05;
    }

    /**
     * 覆寫更新：管理透明度
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO:
        // 1. 呼叫 super.update(deltaTime)
        // 2. 若 isFeeding（靜止吸血中），逐漸降低 alpha
        // 3. 若在飛行中，將 alpha 恢復到 1.0
    }

    /**
     * 覆寫繪製：套用透明度
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO:
        // 1. renderer.setAlpha(this.alpha)
        // 2. 繪製蚊子
        // 3. renderer.resetAlpha()
    }
}
