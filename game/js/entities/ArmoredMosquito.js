/**
 * ArmoredMosquito.js — 裝甲蚊
 *
 * HP = 3，需要點擊 3 次。移動慢但吸血快。
 * 護甲逐步剝落的視覺效果。
 */

import { Mosquito } from './Mosquito.js?v=3';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=3';
import { randomRange } from '../utils/MathUtils.js?v=3';

export class ArmoredMosquito extends Mosquito {
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.ARMORED_MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        // 體積稍大
        this.width = 50;
        this.height = 50;
        this.collisionRadius = 30;

        /** 護甲破碎粒子 */
        this._armorParticles = [];

        /** 護甲抖動 */
        this._hitShake = 0;
    }

    takeDamage(damage) {
        if (!this.isAlive) return false;

        // 產生護甲碎片粒子
        const center = this.getCenter();
        for (let i = 0; i < 6; i++) {
            this._armorParticles.push({
                x: center.x + (Math.random() - 0.5) * 20,
                y: center.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150 - 50,
                size: randomRange(3, 7),
                alpha: 1,
                timer: 0.6,
            });
        }

        this._hitShake = 0.15;

        return super.takeDamage(damage);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // 護甲抖動衰減
        if (this._hitShake > 0) {
            this._hitShake -= deltaTime;
        }

        // 更新碎片粒子
        for (let i = this._armorParticles.length - 1; i >= 0; i--) {
            const p = this._armorParticles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 200 * deltaTime; // 重力
            p.timer -= deltaTime;
            p.alpha = Math.max(0, p.timer / 0.6);
            if (p.timer <= 0) {
                this._armorParticles.splice(i, 1);
            }
        }
    }

    render(renderer) {
        if (!this.isAlive) return;

        const cx = this.x + this.width / 2 + (this._hitShake > 0 ? (Math.random() - 0.5) * 8 : 0);
        const cy = this.y + this.height / 2 + (this._hitShake > 0 ? (Math.random() - 0.5) * 8 : 0);
        const armorRatio = this.hp / this.maxHp;

        if (this._isFlashing) {
            renderer.setAlpha(0.5);
        }

        renderer.save();
        const ctx = renderer.ctx;

        // 翅膀（較厚）
        const wingSpread = Math.sin(this.wingTimer) * 10;
        ctx.fillStyle = 'rgba(180, 180, 200, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx - 18 - wingSpread, cy - 6, 16, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 18 + wingSpread, cy - 6, 16, 9, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 護甲外殼（根據 HP 變色 + 裂痕）
        const armorColor = armorRatio > 0.66 ? '#707888' :
                          armorRatio > 0.33 ? '#886644' : '#884433';
        const armorStroke = armorRatio > 0.66 ? '#8898a8' :
                           armorRatio > 0.33 ? '#aa8855' : '#aa5544';

        // 外殼（大橢圓）
        ctx.fillStyle = armorColor;
        ctx.strokeStyle = armorStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 護甲紋路
        if (armorRatio > 0.33) {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - 5);
            ctx.lineTo(cx + 8, cy - 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy + 5);
            ctx.lineTo(cx + 6, cy + 5);
            ctx.stroke();
        }

        // 裂痕效果（HP 越低裂痕越多）
        if (armorRatio < 0.66) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy - 12);
            ctx.lineTo(cx + 2, cy - 3);
            ctx.lineTo(cx - 3, cy + 6);
            ctx.stroke();
        }
        if (armorRatio < 0.33) {
            ctx.beginPath();
            ctx.moveTo(cx + 6, cy - 8);
            ctx.lineTo(cx + 1, cy + 2);
            ctx.lineTo(cx + 8, cy + 10);
            ctx.stroke();
        }

        // 頭
        renderer.drawCircle(cx, cy - 20, 7, '#505868');

        // 口器
        renderer.drawLine(cx, cy - 27, cx, cy - 36, '#666', 2);

        // 腳（6隻，粗壯）
        ctx.strokeStyle = '#606878';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const legY = cy - 2 + i * 8;
            ctx.beginPath();
            ctx.moveTo(cx - 12, legY);
            ctx.lineTo(cx - 26, legY + 9);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 12, legY);
            ctx.lineTo(cx + 26, legY + 9);
            ctx.stroke();
        }

        // 吸血變紅
        if (this.isFeeding && this.feedingTime > 0.5) {
            const red = Math.min(this.feedingTime / this.maxFeedingTime, 1);
            ctx.fillStyle = `rgba(200, 30, 30, ${red * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 3, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // HP 指示器（小圓點）
        for (let i = 0; i < this.maxHp; i++) {
            const dotX = cx - (this.maxHp - 1) * 5 + i * 10;
            const dotY = cy - 32;
            const color = i < this.hp ? '#44ff44' : '#ff4444';
            renderer.drawCircle(dotX, dotY, 3, color);
        }

        renderer.restore();

        if (this._isFlashing) {
            renderer.resetAlpha();
        }

        // 護甲碎片粒子
        for (const p of this._armorParticles) {
            renderer.setAlpha(p.alpha);
            renderer.drawRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, armorStroke);
            renderer.resetAlpha();
        }
    }
}
