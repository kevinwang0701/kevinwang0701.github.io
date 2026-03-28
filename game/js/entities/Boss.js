/**
 * Boss.js — Boss 敵人
 *
 * 多階段攻擊：idle → summoning → attacking → vulnerable → 循環
 * HP 低於 30% 進入狂暴。毒液彈會反轉玩家游標。
 */

import { Entity } from './Entity.js?v=2';
import { BOSS_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange, distance, angle } from '../utils/MathUtils.js?v=2';

export class Boss extends Entity {
    constructor(x, y) {
        super(x, y, 200, 200);

        const config = BOSS_CONFIG;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.score = config.SCORE;
        this.collisionRadius = 80;

        /** Boss 階段 */
        this.phase = 'idle';
        this.phaseTimer = 2.0;

        /** 小怪召喚 */
        this.minionSpawnInterval = config.MINION_SPAWN_INTERVAL / 1000;
        this.lastMinionSpawn = 0;

        /** 毒液彈 */
        this.venomProjectiles = [];

        /** 破綻窗口 */
        this.isVulnerable = false;
        this.vulnerableTimer = 0;

        /** 狂暴 */
        this.enrageThreshold = 0.3;
        this.isEnraged = false;

        /** 動畫計時 */
        this._animTimer = 0;
        this._bodyPulse = 0;

        /** 攻擊模式循環 */
        this._phaseIndex = 0;
        this._phases = ['summoning', 'attacking', 'vulnerable'];

        /** 浮動 Y */
        this._floatY = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;

        this._animTimer += deltaTime;
        this._bodyPulse = Math.sin(this._animTimer * 3) * 5;
        this._floatY = Math.sin(this._animTimer * 1.5) * 10;

        // 狂暴檢查
        if (!this.isEnraged && this.hp / this.maxHp <= this.enrageThreshold) {
            this.isEnraged = true;
        }

        const speedMult = this.isEnraged ? 1.8 : 1.0;

        this.phaseTimer -= deltaTime * speedMult;

        switch (this.phase) {
            case 'idle':
                if (this.phaseTimer <= 0) {
                    this._nextPhase();
                }
                break;

            case 'summoning':
                this.lastMinionSpawn += deltaTime;
                if (this.lastMinionSpawn >= this.minionSpawnInterval / speedMult) {
                    this.lastMinionSpawn = 0;
                    this._shouldSpawnMinions = true;
                }
                if (this.phaseTimer <= 0) {
                    this._nextPhase();
                }
                break;

            case 'attacking':
                // 定期發射毒液
                this.lastMinionSpawn += deltaTime;
                if (this.lastMinionSpawn >= 0.6 / speedMult) {
                    this.lastMinionSpawn = 0;
                    this._shouldShootVenom = true;
                }
                if (this.phaseTimer <= 0) {
                    this._nextPhase();
                }
                break;

            case 'vulnerable':
                this.isVulnerable = true;
                this.vulnerableTimer -= deltaTime;
                if (this.phaseTimer <= 0) {
                    this.isVulnerable = false;
                    this._nextPhase();
                }
                break;
        }

        // 更新毒液彈
        for (let i = this.venomProjectiles.length - 1; i >= 0; i--) {
            const v = this.venomProjectiles[i];
            v.x += v.vx * deltaTime;
            v.y += v.vy * deltaTime;
            v.timer -= deltaTime;
            if (v.timer <= 0 || v.x < -50 || v.x > CANVAS_WIDTH + 50 ||
                v.y < -50 || v.y > CANVAS_HEIGHT + 50) {
                this.venomProjectiles.splice(i, 1);
            }
        }

        // 自動左右漂移
        const centerX = CANVAS_WIDTH / 2;
        this.x = centerX - this.width / 2 + Math.sin(this._animTimer * 0.5) * 200;
        this.y = 80 + this._floatY;
    }

    render(renderer) {
        if (!this.isAlive) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        renderer.save();
        const ctx = renderer.ctx;

        // ── 翅膀（巨大） ──
        const wingSpread = Math.sin(this._animTimer * 15) * 20;
        ctx.fillStyle = this.isEnraged ?
            'rgba(255, 100, 100, 0.3)' : 'rgba(180, 180, 200, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - 60 - wingSpread, cy - 20, 50, 30, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 60 + wingSpread, cy - 20, 50, 30, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // ── 身體 ──
        const bodyColor = this.isEnraged ? '#660022' : '#2a1a2e';
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 35 + this._bodyPulse, 55 + this._bodyPulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // 身體光澤
        ctx.fillStyle = this.isEnraged ?
            'rgba(255, 50, 50, 0.2)' : 'rgba(100, 100, 150, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 15, 20, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── 頭 ──
        renderer.drawCircle(cx, cy - 60, 25, this.isEnraged ? '#550020' : '#1a0a1e');

        // 眼睛（發光）
        const eyeColor = this.isVulnerable ? '#ffff00' :
                         this.isEnraged ? '#ff0000' : '#aa00ff';
        renderer.drawCircle(cx - 10, cy - 63, 6, eyeColor);
        renderer.drawCircle(cx + 10, cy - 63, 6, eyeColor);
        renderer.drawCircle(cx - 10, cy - 63, 3, '#fff');
        renderer.drawCircle(cx + 10, cy - 63, 3, '#fff');

        // 口器（巨大）
        renderer.drawLine(cx, cy - 80, cx, cy - 105, this.isEnraged ? '#cc0033' : '#666', 4);

        // ── 腳（8隻） ──
        ctx.strokeStyle = this.isEnraged ? '#881133' : '#3a2a3e';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 4; i++) {
            const legY = cy - 10 + i * 20;
            const spread = 25 + i * 8;
            ctx.beginPath();
            ctx.moveTo(cx - 35, legY);
            ctx.lineTo(cx - 35 - spread, legY + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 35, legY);
            ctx.lineTo(cx + 35 + spread, legY + 15);
            ctx.stroke();
        }

        // ── 破綻窗口提示 ──
        if (this.isVulnerable) {
            renderer.setAlpha(0.3 + Math.sin(this._animTimer * 10) * 0.2);
            renderer.drawCircleStroke(cx, cy, 70, '#ffff00', 3);
            renderer.drawCircleStroke(cx, cy, 80, '#ffff00', 2);
            renderer.resetAlpha();

            renderer.drawTextWithStroke(
                '⚡ 弱點暴露！', cx, cy + 80,
                '#ffff00', '#000',
                'bold 22px "Segoe UI", Arial, sans-serif',
                3, 'center', 'middle'
            );
        }

        // ── 狂暴視覺 ──
        if (this.isEnraged) {
            renderer.setAlpha(0.15 + Math.sin(this._animTimer * 8) * 0.1);
            renderer.drawCircle(cx, cy, 90, '#ff0000');
            renderer.resetAlpha();
        }

        renderer.restore();

        // ── 毒液彈 ──
        for (const v of this.venomProjectiles) {
            renderer.setAlpha(0.8);
            renderer.drawCircle(v.x, v.y, 8, '#44ff00');
            renderer.drawCircle(v.x, v.y, 5, '#88ff44');
            renderer.resetAlpha();
        }

        // ── Boss HP 條（畫面頂部） ──
        this._drawBossHPBar(renderer);
    }

    /** @private */
    _drawBossHPBar(renderer) {
        const barX = CANVAS_WIDTH / 2 - 300;
        const barY = 15;
        const barW = 600;
        const barH = 20;
        const hpRatio = Math.max(0, this.hp / this.maxHp);

        renderer.drawRoundRect(barX - 2, barY - 2, barW + 4, barH + 4, 4, 'rgba(0,0,0,0.7)');

        const color = this.isEnraged ? '#ff2222' : `hsl(${280 + hpRatio * 40}, 80%, 50%)`;
        if (barW * hpRatio > 0) {
            renderer.drawRoundRect(barX, barY, barW * hpRatio, barH, 3, color);
        }

        renderer.drawTextWithStroke(
            `🦟 BOSS — ${Math.ceil(this.hp)} / ${this.maxHp}`,
            CANVAS_WIDTH / 2, barY + barH / 2,
            '#fff', '#000',
            'bold 14px "Segoe UI", Arial, sans-serif',
            2, 'center', 'middle'
        );
    }

    takeDamage(damage) {
        if (!this.isVulnerable) {
            this._isFlashing = true;
            this._flashTimer = 0.05;
            return false;
        }
        return super.takeDamage(damage);
    }

    summonMinions() {
        // 回傳需要生成的小怪數量（由 Game.js 處理）
        this._shouldSpawnMinions = false;
        return this.isEnraged ? 4 : 2;
    }

    shootVenom(targetX, targetY) {
        this._shouldShootVenom = false;
        const center = this.getCenter();
        const a = angle(center.x, center.y, targetX, targetY);
        const speed = this.isEnraged ? 350 : 220;
        this.venomProjectiles.push({
            x: center.x,
            y: center.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            timer: 4,
        });
    }

    /** @private */
    _nextPhase() {
        this._phaseIndex = (this._phaseIndex + 1) % this._phases.length;
        this.phase = this._phases[this._phaseIndex];
        this.lastMinionSpawn = 0;

        switch (this.phase) {
            case 'summoning':
                this.phaseTimer = 4;
                break;
            case 'attacking':
                this.phaseTimer = 3;
                break;
            case 'vulnerable':
                this.phaseTimer = 2.5;
                this.isVulnerable = true;
                break;
        }
    }

    hasEscaped() { return false; }
    getBloodDrain() { return 0; }
    calculateScore() { return this.score; }
}
