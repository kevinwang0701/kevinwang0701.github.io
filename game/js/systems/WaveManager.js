/**
 * WaveManager.js — 關卡波次管理器
 *
 * 控制每波敵人的生成節奏與難度遞增。
 * 整合所有敵人類型、Boss 波、陷阱生成。
 */

import { Mosquito } from '../entities/Mosquito.js?v=2';
import { AgileMosquito } from '../entities/AgileMosquito.js?v=2';
import { ArmoredMosquito } from '../entities/ArmoredMosquito.js?v=2';
import { StealthMosquito } from '../entities/StealthMosquito.js?v=2';
import { Trap } from '../entities/Trap.js?v=2';
import { Boss } from '../entities/Boss.js?v=2';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange, randomInt } from '../utils/MathUtils.js?v=2';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.waveSize = 0;
        this.spawnedCount = 0;
        this.remainingEnemies = 0;
        this.spawnInterval = 2.0;
        this.spawnTimer = 0;
        this.isBossWave = false;
        this.isBreak = false;
        this.breakTimer = 0;
        this.breakDuration = 3.0;
        this.isActive = false;
        this.waveKills = 0;
        this._bossSpawned = false;

        /** 是否顯示升級商店（每 3 波） */
        this.showShop = false;
    }

    startNextWave() {
        this.currentWave++;
        this.waveKills = 0;
        this._bossSpawned = false;

        // 每 5 波是 Boss 波
        this.isBossWave = (this.currentWave % 5 === 0);

        if (this.isBossWave) {
            this.waveSize = 1; // Boss 只有一隻
        } else {
            this.waveSize = 3 + Math.floor(this.currentWave * 1.5);
        }

        this.spawnInterval = Math.max(0.4, 2.0 - this.currentWave * 0.08);
        this.spawnedCount = 0;
        this.remainingEnemies = this.waveSize;
        this.spawnTimer = 0.5;
        this.isActive = true;
        this.isBreak = false;
        this.showShop = false;
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // 升級商店中
        if (this.showShop) return;

        // 波次間休息
        if (this.isBreak) {
            this.breakTimer -= deltaTime;
            if (this.breakTimer <= 0) {
                // 每 3 波顯示升級商店
                if (this.currentWave > 0 && this.currentWave % 3 === 0) {
                    this.showShop = true;
                    return;
                }
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
        if (this.isBossWave && !this._bossSpawned) {
            // Boss 波
            const boss = new Boss(CANVAS_WIDTH / 2 - 100, -200);
            this.game.spawnEnemy(boss);
            this.game.currentBoss = boss;
            this._bossSpawned = true;
            this.spawnedCount++;
            return;
        }

        // 從畫面邊緣生成
        const { x, y } = this._getSpawnPosition();

        // 根據波次決定敵人類型
        const enemy = this._createEnemy(x, y);

        // 隨波次提升基礎屬性
        enemy.speed += this.currentWave * 0.1;

        this.game.spawnEnemy(enemy);
        this.spawnedCount++;

        // 有概率同時生成陷阱蜜蜂
        if (this.currentWave >= 3 && Math.random() < 0.15 + this.currentWave * 0.02) {
            const trapPos = this._getSpawnPosition();
            const trap = new Trap(trapPos.x, trapPos.y, 'bee');
            this.game.spawnEnemy(trap);
            // 陷阱不算波次計數
        }
    }

    /** @private */
    _createEnemy(x, y) {
        const wave = this.currentWave;

        // 隨波次增加不同類型的出場機率
        const roll = Math.random();

        if (wave >= 8 && roll < 0.15) {
            return new StealthMosquito(x, y);
        }
        if (wave >= 5 && roll < 0.30) {
            return new ArmoredMosquito(x, y);
        }
        if (wave >= 3 && roll < 0.45) {
            return new AgileMosquito(x, y);
        }

        return new Mosquito(x, y);
    }

    /** @private */
    _getSpawnPosition() {
        const edge = randomInt(0, 3);
        let x, y;
        switch (edge) {
            case 0: x = randomRange(50, CANVAS_WIDTH - 50); y = -40; break;
            case 1: x = CANVAS_WIDTH + 40; y = randomRange(50, CANVAS_HEIGHT - 50); break;
            case 2: x = randomRange(50, CANVAS_WIDTH - 50); y = CANVAS_HEIGHT + 40; break;
            case 3: x = -40; y = randomRange(50, CANVAS_HEIGHT - 50); break;
        }
        return { x, y };
    }

    onEnemyKilled() {
        this.remainingEnemies = Math.max(0, this.remainingEnemies - 1);
        this.waveKills++;
    }

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
        this._bossSpawned = false;
        this.showShop = false;
    }
}
