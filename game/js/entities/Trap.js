/**
 * Trap.js — 陷阱實體（蜜蜂等）
 * 
 * 繼承自 Entity，特點：
 * - 外觀與蚊子相似，容易誤擊
 * - 被擊中時不會死亡，而是扣玩家 HP 或觸發麻痺效果
 * - 需要玩家仔細辨別後避開
 */

import { Entity } from './Entity.js?v=2';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=2';

export class Trap extends Entity {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     * @param {string} type - 陷阱類型（'bee', etc.）
     */
    constructor(x, y, type = 'bee') {
        super(x, y, 40, 40);

        /** @type {string} 陷阱類型 */
        this.type = type;

        const config = ENEMY_CONFIG.TRAP_BEE;

        /** @type {number} 誤擊時扣除玩家的 HP */
        this.penaltyHp = config.PENALTY_HP;

        /** @type {number} 誤擊時造成的麻痺時間（毫秒） */
        this.stunDuration = config.STUN_DURATION;

        /** @type {number} 移動速度 */
        this.speed = config.SPEED;

        /** @type {number} 存活倒數時間（超過後自動離場） */
        this.lifetime = 0;

        /** @type {number} 最大存活時間（秒） */
        this.maxLifetime = 5;
    }

    /**
     * 每幀更新：移動、存活時間倒數
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO:
        // 1. 移動邏輯（飛行動畫）
        // 2. 累加 lifetime，超過 maxLifetime 則自動離場
    }

    /**
     * 繪製陷阱
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO: 繪製蜜蜂或其他陷阱的外觀
    }

    /**
     * 被玩家擊中時觸發的效果
     * @param {PlayerState} playerState - 玩家狀態
     * @returns {{hpPenalty: number, stunDuration: number}} 懲罰資訊
     */
    onHit(playerState) {
        // TODO:
        // 1. 扣除玩家 HP
        // 2. 觸發麻痺效果
        // 3. 回傳懲罰資訊供 UI 顯示
    }
}
