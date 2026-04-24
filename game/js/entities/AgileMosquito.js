/**
 * AgileMosquito.js — 敏捷蚊
 *
 * 繼承自 Mosquito，特點：
 * - 不規則飛行軌跡（正弦波疊加）
 * - 速度更快，更難擊中
 * - 殘影效果
 * - 分數更高
 */

import { Mosquito } from './Mosquito.js?v=3';
import { ENEMY_CONFIG } from '../utils/Constants.js?v=3';
import { randomRange } from '../utils/MathUtils.js?v=3';

export class AgileMosquito extends Mosquito {
    constructor(x, y) {
        super(x, y);

        const config = ENEMY_CONFIG.AGILE_MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** 飛行路徑的時間參數 */
        this.pathTime = Math.random() * Math.PI * 2;

        /** 飛行振幅 */
        this.amplitude = randomRange(60, 120);

        /** 不規則頻率 */
        this.freq1 = randomRange(2, 4);
        this.freq2 = randomRange(3, 6);

        /** 殘影紀錄 */
        this._afterImages = [];
        this._afterImageTimer = 0;

        /** 縮短停留時間（更難擊中） */
        this.maxFeedingTime = randomRange(1.5, 3);
    }

    update(deltaTime) {
        // 記錄殘影位置
        this._afterImageTimer += deltaTime;
        if (this._afterImageTimer >= 0.03) {
            this._afterImageTimer = 0;
            this._afterImages.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                alpha: 0.4,
            });
            if (this._afterImages.length > 8) {
                this._afterImages.shift();
            }
        }

        // 衰減殘影
        for (const img of this._afterImages) {
            img.alpha -= deltaTime * 3;
        }
        this._afterImages = this._afterImages.filter(i => i.alpha > 0.02);

        // 更新路徑時間（用於不規則飛行）
        this.pathTime += deltaTime;

        super.update(deltaTime);
    }

    /** 覆寫飛行更新：加入不規則偏移 */
    _updateFlying(deltaTime) {
        // 在原始飛行邏輯上疊加正弦波偏移
        const wobbleX = Math.sin(this.pathTime * this.freq1) * this.amplitude * deltaTime;
        const wobbleY = Math.cos(this.pathTime * this.freq2) * this.amplitude * 0.7 * deltaTime;

        // 先執行基礎飛行
        super._updateFlying(deltaTime);

        // 疊加不規則偏移
        this.x += wobbleX;
        this.y += wobbleY;
    }

    render(renderer) {
        if (!this.isAlive) return;

        // 繪製殘影
        for (const img of this._afterImages) {
            renderer.setAlpha(img.alpha * 0.3);
            renderer.drawCircle(img.x, img.y, 10, '#44ccff');
            renderer.resetAlpha();
        }

        // 繪製蚊子本體（調色為藍色系）
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this._isFlashing) {
            renderer.setAlpha(0.5);
        }

        renderer.save();
        const ctx = renderer.ctx;

        // 翅膀（更快振動）
        const wingSpread = Math.sin(this.wingTimer * 1.5) * 15;

        // 左翅
        ctx.fillStyle = 'rgba(100, 180, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx - 16 - wingSpread, cy - 5, 12, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // 右翅
        ctx.beginPath();
        ctx.ellipse(cx + 16 + wingSpread, cy - 5, 12, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 身體（較纖細，藍灰色）
        ctx.fillStyle = '#2a4060';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 頭
        renderer.drawCircle(cx, cy - 14, 5, '#1e3050');

        // 口器
        renderer.drawLine(cx, cy - 19, cx, cy - 28, '#4488aa', 1.2);

        // 腳（細長）
        ctx.strokeStyle = '#3a6688';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
            const legY = cy - 1 + i * 6;
            ctx.beginPath();
            ctx.moveTo(cx - 6, legY);
            ctx.lineTo(cx - 20, legY + 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 6, legY);
            ctx.lineTo(cx + 20, legY + 7);
            ctx.stroke();
        }

        // 速度線效果
        if (this.behavior === 'flying' || this.behavior === 'leaving') {
            renderer.setAlpha(0.2);
            for (let i = 0; i < 3; i++) {
                const lineX = cx - 25 - i * 8;
                renderer.drawLine(lineX, cy - 3 + i * 3, lineX - 15, cy - 3 + i * 3, '#66aaff', 1);
            }
            renderer.resetAlpha();
        }

        // 吸血變色
        if (this.isFeeding && this.feedingTime > 0.3) {
            const red = Math.min(this.feedingTime / this.maxFeedingTime, 1);
            ctx.fillStyle = `rgba(180, 40, 60, ${red * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 2, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        renderer.restore();

        if (this._isFlashing) {
            renderer.resetAlpha();
        }
    }
}
