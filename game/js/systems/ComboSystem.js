/**
 * ComboSystem.js — Combo 連擊系統
 */

import { COMBO_CONFIG } from '../utils/Constants.js?v=2';

export class ComboSystem {
    constructor() {
        this.count = 0;
        this.multiplier = 1.0;
        this.maxCombo = 0;
        this.isFrenzyReady = false;

        /** 顯示用：Combo 文字的縮放動畫 */
        this.displayScale = 1.0;

        /** Combo 文字的抖動量 */
        this.shakeAmount = 0;
    }

    /**
     * 命中敵人
     * @returns {number} 目前倍率
     */
    onHit() {
        this.count++;
        this.multiplier = Math.min(
            1.0 + (this.count - 1) * COMBO_CONFIG.MULTIPLIER_STEP,
            COMBO_CONFIG.MAX_MULTIPLIER
        );

        if (this.count > this.maxCombo) {
            this.maxCombo = this.count;
        }

        // 命中動畫
        this.displayScale = 1.4;
        this.shakeAmount = 5;

        // 檢查狂熱閾值
        if (this.count >= COMBO_CONFIG.FRENZY_THRESHOLD && !this.isFrenzyReady) {
            this.isFrenzyReady = true;
        }

        return this.multiplier;
    }

    /**
     * 揮空（未命中）
     * @returns {number} 僵直時間（毫秒）
     */
    onMiss() {
        this.count = 0;
        this.multiplier = 1.0;
        this.isFrenzyReady = false;
        this.displayScale = 0.5;
        return COMBO_CONFIG.MISS_STUN_DURATION;
    }

    /**
     * 每幀更新動畫
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // 縮放動畫回歸
        if (this.displayScale !== 1.0) {
            this.displayScale += (1.0 - this.displayScale) * deltaTime * 10;
            if (Math.abs(this.displayScale - 1.0) < 0.01) {
                this.displayScale = 1.0;
            }
        }

        // 抖動衰減
        if (this.shakeAmount > 0) {
            this.shakeAmount *= Math.max(0, 1 - deltaTime * 15);
            if (this.shakeAmount < 0.1) this.shakeAmount = 0;
        }
    }

    /** 重置 */
    reset() {
        this.count = 0;
        this.multiplier = 1.0;
        this.maxCombo = 0;
        this.isFrenzyReady = false;
        this.displayScale = 1.0;
        this.shakeAmount = 0;
    }

    /** 消耗狂熱 */
    consumeFrenzy() {
        this.isFrenzyReady = false;
        this.count = 0;
    }
}
