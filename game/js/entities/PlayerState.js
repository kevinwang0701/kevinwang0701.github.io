/**
 * PlayerState.js — 玩家狀態管理
 */

import { PLAYER_DEFAULTS } from '../utils/Constants.js?v=3';

export class PlayerState {
    constructor() {
        this.hp = PLAYER_DEFAULTS.MAX_HP;
        this.maxHp = PLAYER_DEFAULTS.MAX_HP;
        this.score = PLAYER_DEFAULTS.STARTING_SCORE;
        this.combo = PLAYER_DEFAULTS.STARTING_COMBO;
        this.currentWeapon = 'swatter';
        this.isStunned = false;
        this.stunTimer = 0;
        this.isCursorInverted = false;
        this.cursorInvertTimer = 0;
        this.upgrades = {};
        this.insecticideRemaining = 3;
        this.enemiesKilled = 0;
    }

    /**
     * 受到傷害
     * @param {number} amount
     */
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    /**
     * 回復 HP
     * @param {number} amount
     */
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    /**
     * 增加分數
     * @param {number} points
     * @param {number} multiplier
     */
    addScore(points, multiplier = 1) {
        this.score += Math.floor(points * multiplier);
    }

    /**
     * 觸發僵直
     * @param {number} duration - 毫秒
     */
    applyStun(duration) {
        this.isStunned = true;
        this.stunTimer = duration / 1000; // 轉為秒
    }

    /**
     * 觸發游標反轉
     * @param {number} duration - 毫秒
     */
    applyCursorInvert(duration) {
        this.isCursorInverted = true;
        this.cursorInvertTimer = duration / 1000;
    }

    /**
     * 每幀更新計時器
     * @param {number} deltaTime - 秒
     */
    update(deltaTime) {
        if (this.isStunned) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.stunTimer = 0;
            }
        }

        if (this.isCursorInverted) {
            this.cursorInvertTimer -= deltaTime;
            if (this.cursorInvertTimer <= 0) {
                this.isCursorInverted = false;
                this.cursorInvertTimer = 0;
            }
        }
    }

    /** 重置 */
    reset() {
        this.hp = PLAYER_DEFAULTS.MAX_HP;
        this.maxHp = PLAYER_DEFAULTS.MAX_HP;
        this.score = PLAYER_DEFAULTS.STARTING_SCORE;
        this.combo = PLAYER_DEFAULTS.STARTING_COMBO;
        this.currentWeapon = 'swatter';
        this.isStunned = false;
        this.stunTimer = 0;
        this.isCursorInverted = false;
        this.cursorInvertTimer = 0;
        this.upgrades = {};
        this.insecticideRemaining = 3;
        this.enemiesKilled = 0;
    }

    /** 是否已死亡 */
    isDead() {
        return this.hp <= 0;
    }
}
