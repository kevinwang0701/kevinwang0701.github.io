/**
 * Boss.js — Boss 敵人
 * 
 * 繼承自 Entity，特點：
 * - 大量 HP，具備大血條顯示
 * - 多階段攻擊模式（召喚小怪、噴射毒液）
 * - 毒液碰觸會導致游標反轉
 * - 需要抓準破綻窗口進行攻擊
 */

import { Entity } from './Entity.js?v=2';
import { BOSS_CONFIG } from '../utils/Constants.js?v=2';

export class Boss extends Entity {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     */
    constructor(x, y) {
        super(x, y, 200, 200); // Boss 體積較大

        const config = BOSS_CONFIG;

        this.hp = config.HP;
        this.maxHp = config.HP;

        /** @type {number} 擊殺分數 */
        this.score = config.SCORE;

        /** @type {string} Boss 階段：'idle' | 'attacking' | 'summoning' | 'vulnerable' | 'enraged' */
        this.phase = 'idle';

        /** @type {number} 當前攻擊模式的計時器 */
        this.phaseTimer = 0;

        /** @type {number} 小怪召喚間隔 */
        this.minionSpawnInterval = config.MINION_SPAWN_INTERVAL;

        /** @type {number} 上次召喚小怪的時間 */
        this.lastMinionSpawn = 0;

        /** @type {Array<{x: number, y: number, radius: number}>} 毒液彈列表 */
        this.venomProjectiles = [];

        /** @type {boolean} 是否正處於破綻窗口（可受傷） */
        this.isVulnerable = false;

        /** @type {number} 狂暴閾值（HP 低於此比例時進入狂暴） */
        this.enrageThreshold = 0.3;
    }

    /**
     * 每幀更新：階段切換、攻擊模式、小怪召喚
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO:
        // 1. 更新 phaseTimer
        // 2. 根據 phase 執行不同邏輯
        // 3. 檢查是否應進入狂暴模式
        // 4. 更新毒液彈位置
    }

    /**
     * 繪製 Boss（含大血條）
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO:
        // 1. 繪製 Boss 本體
        // 2. 繪製大血條（在 Boss 上方或畫面頂部）
        // 3. 繪製毒液彈
        // 4. 若處於破綻窗口，顯示視覺提示
    }

    /**
     * 覆寫受傷：只有在 isVulnerable 時才受傷
     * @param {number} damage
     * @returns {boolean}
     */
    takeDamage(damage) {
        // TODO:
        // if (!this.isVulnerable) return false;
        // return super.takeDamage(damage);
    }

    /**
     * 召喚小怪
     * @returns {Array<Entity>} 被召喚的小怪列表（由 Game 加入場上）
     */
    summonMinions() {
        // TODO: 在 Boss 周圍生成數隻普通蚊子
    }

    /**
     * 發射毒液彈
     * @param {number} targetX - 目標 X（通常是玩家游標位置）
     * @param {number} targetY - 目標 Y
     */
    shootVenom(targetX, targetY) {
        // TODO: 建立毒液彈並加入 venomProjectiles
    }

    /**
     * 切換到下一個攻擊階段
     * @private
     */
    _nextPhase() {
        // TODO: 循環切換攻擊模式
    }
}
