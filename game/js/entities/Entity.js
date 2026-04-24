/**
 * Entity.js — 遊戲實體抽象基礎類別
 */

import { circleIntersect } from '../utils/CollisionUtils.js?v=3';

export class Entity {
    /**
     * @param {number} x - 初始 X 座標
     * @param {number} y - 初始 Y 座標
     * @param {number} width - 寬度
     * @param {number} height - 高度
     */
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hp = 1;
        this.maxHp = 1;
        this.isAlive = true;
        this.collisionRadius = Math.max(width, height) / 2;

        // 閃爍效果（被擊中反饋）
        this._flashTimer = 0;
        this._isFlashing = false;
    }

    /**
     * 每幀更新（子類覆寫）
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // 閃爍計時
        if (this._isFlashing) {
            this._flashTimer -= deltaTime;
            if (this._flashTimer <= 0) {
                this._isFlashing = false;
            }
        }
    }

    /**
     * 繪製（子類覆寫）
     * @param {import('../core/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        // 子類實作
    }

    /**
     * 受到傷害
     * @param {number} damage
     * @returns {boolean} 是否因此次傷害而死亡
     */
    takeDamage(damage) {
        if (!this.isAlive) return false;

        this.hp -= damage;
        this._isFlashing = true;
        this._flashTimer = 0.1; // 閃爍 0.1 秒

        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            return true;
        }
        return false;
    }

    /** 取得中心座標 */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    /** 檢測碰撞 */
    collidesWith(other) {
        const a = this.getCenter();
        const b = other.getCenter();
        return circleIntersect(a.x, a.y, this.collisionRadius, b.x, b.y, other.collisionRadius);
    }

    /** 銷毀清理 */
    destroy() {
        this.isAlive = false;
    }
}
