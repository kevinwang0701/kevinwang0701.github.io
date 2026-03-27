/**
 * AgileMosquito.js — 敏捷蚊
 * 
 * 繼承自 Mosquito，特點：
 * - 不規則飛行軌跡（使用貝茲曲線或噪聲函數）
 * - 速度更快，更難擊中
 * - 分數更高
 */

import { Mosquito } from './Mosquito.js?v=2';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=2';

export class AgileMosquito extends Mosquito {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     */
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.AGILE_MOSQUITO;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** @type {number} 飛行路徑的時間參數（用於曲線計算） */
        this.pathTime = 0;

        /** @type {number} 飛行振幅（不規則程度） */
        this.amplitude = 0;
    }

    /**
     * 覆寫更新：使用不規則飛行路徑
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO: 不規則飛行路徑計算（正弦波疊加或 Perlin noise）
        // 其餘吸血邏輯沿用 super.update(deltaTime)
    }

    /**
     * 覆寫繪製：可能需要不同的外觀
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO: 繪製敏捷蚊的外觀（可能有殘影效果）
    }
}
