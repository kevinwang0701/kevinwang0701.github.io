/**
 * ElectricSwatter.js — 電蚊拍
 *
 * 按住拖曳產生電擊軌跡，軌跡碰到的蚊子受到傷害。
 * 消耗電量槽，鬆開後自動回充。
 */

import { Weapon } from './Weapon.js?v=2';
import { WEAPON_CONFIG } from '../utils/Constants.js?v=2';
import { lineIntersectCircle } from '../utils/CollisionUtils.js?v=2';

export class ElectricSwatter extends Weapon {
    constructor() {
        super('electric_swatter', '電蚊拍');

        const config = WEAPON_CONFIG.ELECTRIC_SWATTER;
        this.damage = config.DAMAGE;
        this.trailWidth = config.TRAIL_WIDTH;
        this.charge = config.MAX_CHARGE;
        this.maxCharge = config.MAX_CHARGE;
        this.drainRate = config.DRAIN_RATE;
        this.rechargeRate = config.RECHARGE_RATE;

        this.isActive = false;
        this.trail = [];

        /** 已命中的敵人 Set（避免連續幀重複傷害） */
        this._hitEnemies = new Set();

        /** 電弧視覺效果 */
        this._sparks = [];
    }

    attack(x, y, enemies, currentTime) {
        if (!this.isActive || this.charge <= 0) return [];

        // 加入軌跡點
        this.trail.push({ x, y, time: currentTime });

        // 保留最近的軌跡點
        if (this.trail.length > 30) {
            this.trail.shift();
        }

        // 使用最後兩個點做碰撞檢測
        if (this.trail.length < 2) return [];

        const p1 = this.trail[this.trail.length - 2];
        const p2 = this.trail[this.trail.length - 1];

        const hitEnemies = [];
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            if (this._hitEnemies.has(enemy)) continue; // 已命中過

            const center = enemy.getCenter();
            if (lineIntersectCircle(
                p1.x, p1.y, p2.x, p2.y,
                center.x, center.y, this.trailWidth + enemy.collisionRadius
            )) {
                hitEnemies.push(enemy);
                this._hitEnemies.add(enemy);

                // 火花特效
                this._sparks.push({
                    x: center.x, y: center.y,
                    timer: 0.3,
                });
            }
        }

        // 消耗電量
        this.charge -= this.drainRate;

        return hitEnemies;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.isActive) {
            // 電量耗盡
            if (this.charge <= 0) {
                this.charge = 0;
                this.stopUse();
            }
        } else {
            // 回充
            this.charge = Math.min(this.maxCharge, this.charge + this.rechargeRate * 60 * deltaTime);
        }

        // 更新火花
        for (let i = this._sparks.length - 1; i >= 0; i--) {
            this._sparks[i].timer -= deltaTime;
            if (this._sparks[i].timer <= 0) {
                this._sparks.splice(i, 1);
            }
        }

        // 軌跡淡出
        if (!this.isActive && this.trail.length > 0) {
            this.trail = [];
        }
    }

    render(renderer, cursorX, cursorY) {
        const ctx = renderer.ctx;

        // 電擊軌跡
        if (this.trail.length >= 2 && this.isActive) {
            // 發光底層
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.lineWidth = this.trailWidth * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();

            // 閃電效果（鋸齒線）
            ctx.strokeStyle = '#44ddff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                const jx = this.trail[i].x + (Math.random() - 0.5) * 8;
                const jy = this.trail[i].y + (Math.random() - 0.5) * 8;
                ctx.lineTo(jx, jy);
            }
            ctx.stroke();

            // 核心亮線
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // 火花
        for (const spark of this._sparks) {
            const alpha = spark.timer / 0.3;
            renderer.setAlpha(alpha);
            for (let i = 0; i < 4; i++) {
                const sx = spark.x + (Math.random() - 0.5) * 20;
                const sy = spark.y + (Math.random() - 0.5) * 20;
                renderer.drawCircle(sx, sy, 3, '#ffff88');
            }
            renderer.resetAlpha();
        }

        // 電蚊拍游標
        renderer.save();
        ctx.translate(cursorX, cursorY);

        // 握柄
        ctx.fillStyle = '#555555';
        ctx.fillRect(-3, 0, 6, 40);

        // 拍頭（圓形網狀）
        const chargeRatio = this.charge / this.maxCharge;
        ctx.strokeStyle = this.isActive ? `hsl(190, 100%, ${50 + chargeRatio * 30}%)` : '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -18, 18, 0, Math.PI * 2);
        ctx.stroke();

        // 網格
        ctx.strokeStyle = this.isActive ? `rgba(100, 220, 255, ${0.5 + chargeRatio * 0.5})` : 'rgba(150,150,150,0.4)';
        ctx.lineWidth = 1;
        for (let i = -12; i <= 12; i += 6) {
            ctx.beginPath();
            ctx.moveTo(i, -30);
            ctx.lineTo(i, -6);
            ctx.stroke();
        }
        for (let j = -28; j <= -8; j += 5) {
            ctx.beginPath();
            ctx.moveTo(-14, j);
            ctx.lineTo(14, j);
            ctx.stroke();
        }

        // 使用中的電弧
        if (this.isActive && this.charge > 0) {
            ctx.strokeStyle = '#88eeff';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo((Math.random() - 0.5) * 20, -30 + Math.random() * 24);
                ctx.lineTo((Math.random() - 0.5) * 20, -30 + Math.random() * 24);
                ctx.stroke();
            }
        }

        renderer.restore();

        // 電量條（游標旁）
        this._drawChargeBar(renderer, cursorX + 30, cursorY - 30);
    }

    /** @private */
    _drawChargeBar(renderer, x, y) {
        const barW = 6;
        const barH = 50;
        const ratio = this.charge / this.maxCharge;

        renderer.setAlpha(0.6);
        renderer.drawRect(x, y, barW, barH, 'rgba(0,0,0,0.5)');
        const fillH = barH * ratio;
        const color = ratio > 0.5 ? '#44ddff' : ratio > 0.2 ? '#ffaa44' : '#ff4444';
        if (fillH > 0) {
            renderer.drawRect(x, y + barH - fillH, barW, fillH, color);
        }
        renderer.resetAlpha();
    }

    startUse() {
        if (this.charge > 0) {
            this.isActive = true;
            this.trail = [];
            this._hitEnemies.clear();
        }
    }

    stopUse() {
        this.isActive = false;
        this.trail = [];
        this._hitEnemies.clear();
    }
}
