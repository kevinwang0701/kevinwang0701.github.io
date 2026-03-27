/**
 * WaveManager.js — 關卡波次管理器
 *
 * 控制每波敵人的生成節奏與難度遞增。
 */

import { Mosquito } from '../entities/Mosquito.js?v=2';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange, randomInt } from '../utils/MathUtils.js?v=2';

export class WaveManager {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;

        /** 目前波次 */
        this.currentWave = 0;

        /** 本波需要生成的總數 */
        this.waveSize = 0;

        /** 已生成數 */
        this.spawnedCount = 0;

        /** 場上存活 + 尚未生成的剩餘數 */
        this.remainingEnemies = 0;

        /** 生成間隔（秒） */
        this.spawnInterval = 2.0;

        /** 生成計時器 */
        this.spawnTimer = 0;

        /** 是否為 Boss 波 */
        this.isBossWave = false;

        /** 波次間休息 */
        this.isBreak = false;
        this.breakTimer = 0;
        this.breakDuration = 3.0; // 波次間休息秒數

        /** 波次是否已啟動 */
        this.isActive = false;

        /** 本波擊殺數 */
        this.waveKills = 0;
    }

    /** 開始下一波 */
    startNextWave() {
        this.currentWave++;
        this.waveKills = 0;

        // 難度遞增公式
        this.waveSize = 3 + Math.floor(this.currentWave * 1.5);
        this.spawnInterval = Math.max(0.5, 2.0 - this.currentWave * 0.1);

        // 每 5 波是 Boss 波（Phase 2 先不實作 Boss）
        this.isBossWave = (this.currentWave % 5 === 0);

        this.spawnedCount = 0;
        this.remainingEnemies = this.waveSize;
        this.spawnTimer = 0.5; // 第一隻延遲 0.5 秒
        this.isActive = true;
        this.isBreak = false;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // 波次間休息
        if (this.isBreak) {
            this.breakTimer -= deltaTime;
            if (this.breakTimer <= 0) {
                this.startNextWave();
            }
            return;
        }

        // 生成敵人
        if (this.spawnedCount < this.waveSize) {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0) {
                this._spawnEnemy();
                this.spawnTimer = this.spawnInterval;
            }
        }

        // 本波全部生成且場上無敵人 → 進入休息
        if (this.spawnedCount >= this.waveSize && this.remainingEnemies <= 0) {
            this.isBreak = true;
            this.breakTimer = this.breakDuration;
        }
    }

    /** @private */
    _spawnEnemy() {
        // 從畫面邊緣生成
        const edge = randomInt(0, 3);
        let x, y;

        switch (edge) {
            case 0: // 上方
                x = randomRange(50, CANVAS_WIDTH - 50);
                y = -40;
                break;
            case 1: // 右方
                x = CANVAS_WIDTH + 40;
                y = randomRange(50, CANVAS_HEIGHT - 50);
                break;
            case 2: // 下方
                x = randomRange(50, CANVAS_WIDTH - 50);
                y = CANVAS_HEIGHT + 40;
                break;
            case 3: // 左方
                x = -40;
                y = randomRange(50, CANVAS_HEIGHT - 50);
                break;
        }

        // Phase 2 只生成普通蚊子
        const mosquito = new Mosquito(x, y);

        // 隨著波次提升蚊子速度
        mosquito.speed += this.currentWave * 0.15;

        this.game.spawnEnemy(mosquito);
        this.spawnedCount++;
    }

    /** 通知有敵人被消滅/離場 */
    onEnemyKilled() {
        this.remainingEnemies--;
        this.waveKills++;
    }

    /** 重置 */
    reset() {
        this.currentWave = 0;
        this.waveSize = 0;
        this.spawnedCount = 0;
        this.remainingEnemies = 0;
        this.spawnTimer = 0;
        this.isBossWave = false;
        this.isBreak = false;
        this.breakTimer = 0;
        this.isActive = false;
        this.waveKills = 0;
    }
}
