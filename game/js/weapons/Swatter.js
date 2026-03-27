/**
 * Swatter.js — 蒼蠅拍
 *
 * 點擊式攻擊，圓形範圍判定。
 * 附帶揮擊動畫與衝擊波效果。
 */

import { Weapon } from './Weapon.js?v=2';
import { WEAPON_CONFIG } from '../utils/Constants.js?v=2';
import { pointInCircle } from '../utils/CollisionUtils.js?v=2';

export class Swatter extends Weapon {
    constructor() {
        super('swatter', '蒼蠅拍');

        const config = WEAPON_CONFIG.SWATTER;
        this.damage = config.DAMAGE;
        this.range = config.RANGE;
        this.cooldown = config.COOLDOWN / 1000; // 轉為秒

        /** 揮擊位置 */
        this.swingPosition = { x: 0, y: 0 };

        /** 揮擊角度 */
        this.swingAngle = 0;

        /** 揮擊動畫持續時間 */
        this.swingDuration = 0.15;

        /** 衝擊波效果列表 */
        this._impacts = [];
    }

    /**
     * 蒼蠅拍攻擊
     * @param {number} x
     * @param {number} y
     * @param {Array<import('../entities/Entity.js').Entity>} enemies
     * @param {number} currentTime
     * @returns {Array} 被命中的敵人
     */
    attack(x, y, enemies, currentTime) {
        if (!this.isReady(currentTime)) return [];

        this.lastAttackTime = currentTime;
        this.swingPosition = { x, y };
        this.swingAngle = -Math.PI / 4 + Math.random() * Math.PI / 2;
        this._isAnimating = true;
        this._animTimer = this.swingDuration;

        // 加入衝擊波效果
        this._impacts.push({
            x, y,
            radius: 0,
            maxRadius: this.range * 1.5,
            alpha: 1,
            timer: 0.3,
        });

        // 碰撞偵測
        const hitEnemies = [];
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            const center = enemy.getCenter();
            if (pointInCircle(x, y, center.x, center.y, this.range + enemy.collisionRadius)) {
                hitEnemies.push(enemy);
            }
        }

        return hitEnemies;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        super.update(deltaTime);

        // 更新衝擊波
        for (let i = this._impacts.length - 1; i >= 0; i--) {
            const impact = this._impacts[i];
            impact.timer -= deltaTime;
            impact.radius += (impact.maxRadius / 0.3) * deltaTime;
            impact.alpha = Math.max(0, impact.timer / 0.3);
            if (impact.timer <= 0) {
                this._impacts.splice(i, 1);
            }
        }
    }

    /**
     * @param {import('../core/Renderer.js').Renderer} renderer
     * @param {number} cursorX
     * @param {number} cursorY
     */
    render(renderer, cursorX, cursorY) {
        // ── 繪製衝擊波 ──
        for (const impact of this._impacts) {
            renderer.setAlpha(impact.alpha * 0.4);
            renderer.drawCircleStroke(impact.x, impact.y, impact.radius, '#fff', 3);
            renderer.resetAlpha();
        }

        // ── 繪製蒼蠅拍游標 ──
        renderer.save();
        const ctx = renderer.ctx;

        // 揮擊動畫的旋轉
        let rotAngle = 0;
        if (this._isAnimating) {
            const progress = 1 - (this._animTimer / this.swingDuration);
            rotAngle = Math.sin(progress * Math.PI) * 0.6;
        }

        ctx.translate(cursorX, cursorY);
        ctx.rotate(rotAngle + Math.PI / 6);

        // 握柄
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-3, 0, 6, 45);

        // 拍面
        ctx.fillStyle = this._isAnimating ? '#ff6644' : '#d4a574';
        ctx.strokeStyle = '#6b3a1f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // 安全的圓角矩形繪製
        const rx = -18, ry = -30, rw = 36, rh = 34, rr = 4;
        if (ctx.roundRect) {
            ctx.roundRect(rx, ry, rw, rh, rr);
        } else {
            ctx.moveTo(rx + rr, ry);
            ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
            ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
            ctx.arcTo(rx, ry + rh, rx, ry, rr);
            ctx.arcTo(rx, ry, rx + rw, ry, rr);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // 拍面網格
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        for (let i = -12; i <= 12; i += 6) {
            ctx.beginPath();
            ctx.moveTo(i, -26);
            ctx.lineTo(i, 0);
            ctx.stroke();
        }
        for (let j = -24; j <= 0; j += 6) {
            ctx.beginPath();
            ctx.moveTo(-15, j);
            ctx.lineTo(15, j);
            ctx.stroke();
        }

        renderer.restore();
    }
}
