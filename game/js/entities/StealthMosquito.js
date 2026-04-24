/**
 * StealthMosquito.js — 隱形蚊
 *
 * 靜止吸血時逐漸透明，飛行時才顯形。
 * 有微弱的漣漪提示。
 */

import { Mosquito } from './Mosquito.js?v=3';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=3';
import { clamp } from '../utils/MathUtils.js?v=3';

export class StealthMosquito extends Mosquito {
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.STEALTH_MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** 目前透明度 */
        this.alpha = 1.0;

        /** 透明度變化速率 */
        this.fadeSpeed = 0.4;

        /** 最低透明度 */
        this.minAlpha = 0.05;

        /** 漣漪效果計時 */
        this._rippleTimer = 0;
        this._ripples = [];
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;

        // 吸血中 → 逐漸隱形
        if (this.isFeeding) {
            this.alpha = clamp(this.alpha - this.fadeSpeed * deltaTime, this.minAlpha, 1.0);

            // 產生漣漪提示
            this._rippleTimer += deltaTime;
            if (this._rippleTimer >= 1.5 && this.alpha < 0.3) {
                this._rippleTimer = 0;
                const center = this.getCenter();
                this._ripples.push({
                    x: center.x,
                    y: center.y,
                    radius: 5,
                    maxRadius: 35,
                    alpha: 0.3,
                    timer: 0.8,
                });
            }
        } else {
            // 飛行中 → 逐漸顯形
            this.alpha = clamp(this.alpha + this.fadeSpeed * 2 * deltaTime, this.minAlpha, 1.0);
        }

        // 被擊中時暫時顯形
        if (this._isFlashing) {
            this.alpha = 1.0;
        }

        // 更新漣漪
        for (let i = this._ripples.length - 1; i >= 0; i--) {
            const r = this._ripples[i];
            r.timer -= deltaTime;
            r.radius += (r.maxRadius / 0.8) * deltaTime;
            r.alpha = Math.max(0, r.timer / 0.8) * 0.3;
            if (r.timer <= 0) {
                this._ripples.splice(i, 1);
            }
        }
    }

    render(renderer) {
        if (!this.isAlive) return;

        // 漣漪提示
        for (const r of this._ripples) {
            renderer.setAlpha(r.alpha);
            renderer.drawCircleStroke(r.x, r.y, r.radius, 'rgba(200, 255, 200, 0.5)', 1.5);
            renderer.resetAlpha();
        }

        // 套用透明度
        renderer.setAlpha(this.alpha);

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        renderer.save();
        const ctx = renderer.ctx;

        // 翅膀（半透明加強）
        const wingSpread = Math.sin(this.wingTimer) * 12;
        ctx.fillStyle = `rgba(150, 220, 150, ${0.3 * this.alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx - 15 - wingSpread, cy - 5, 14, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 15 + wingSpread, cy - 5, 14, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 身體（綠灰色調）
        ctx.fillStyle = '#2a402a';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 頭
        renderer.drawCircle(cx, cy - 16, 6, '#1e301e');

        // 口器
        renderer.drawLine(cx, cy - 22, cx, cy - 32, '#446644', 1.5);

        // 腳
        ctx.strokeStyle = '#3a5a3a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const legY = cy - 2 + i * 7;
            ctx.beginPath();
            ctx.moveTo(cx - 8, legY);
            ctx.lineTo(cx - 22, legY + 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 8, legY);
            ctx.lineTo(cx + 22, legY + 8);
            ctx.stroke();
        }

        // 隱形時的微光特效
        if (this.alpha < 0.3) {
            ctx.fillStyle = `rgba(100, 255, 100, ${0.1 * (1 - this.alpha)})`;
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // 吸血變紅
        if (this.isFeeding && this.feedingTime > 0.5) {
            const red = Math.min(this.feedingTime / this.maxFeedingTime, 1);
            ctx.fillStyle = `rgba(180, 30, 30, ${red * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 2, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        renderer.restore();
        renderer.resetAlpha();
    }
}
