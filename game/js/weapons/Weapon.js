/**
 * Weapon.js — 武器抽象基礎類別
 */

export class Weapon {
    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.damage = 1;
        this.range = 40;
        this.cooldown = 0.1; // 秒
        this.lastAttackTime = 0;
        this.canAttack = true;

        /** 揮擊動畫狀態 */
        this._animTimer = 0;
        this._isAnimating = false;
    }

    /**
     * 檢查武器是否冷卻完畢
     * @param {number} currentTime - 秒
     * @returns {boolean}
     */
    isReady(currentTime) {
        return (currentTime - this.lastAttackTime) >= this.cooldown;
    }

    /**
     * 執行攻擊（子類覆寫）
     * @param {number} x
     * @param {number} y
     * @param {Array} enemies
     * @param {number} currentTime
     * @returns {Array} 被命中的敵人
     */
    attack(x, y, enemies, currentTime) {
        return [];
    }

    /**
     * 每幀更新
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (this._isAnimating) {
            this._animTimer -= deltaTime;
            if (this._animTimer <= 0) {
                this._isAnimating = false;
            }
        }
    }

    /**
     * 繪製（子類覆寫）
     * @param {import('../core/Renderer.js').Renderer} renderer
     * @param {number} cursorX
     * @param {number} cursorY
     */
    render(renderer, cursorX, cursorY) {
        // 子類實作
    }
}
