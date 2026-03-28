/**
 * Trap.js — 蜜蜂陷阱
 *
 * 外觀類似蚊子，被誤擊時扣玩家 HP 並觸發麻痺。
 * 有自動離場的存活時間。
 */

import { Entity } from './Entity.js?v=2';
import { ENEMY_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange, randomInt } from '../utils/MathUtils.js?v=2';

export class Trap extends Entity {
    constructor(x, y, type = 'bee') {
        super(x, y, 38, 38);

        this.type = type;
        this.isTrap = true; // 標記為陷阱

        const config = ENEMY_CONFIG.TRAP_BEE;
        this.penaltyHp = config.PENALTY_HP;
        this.stunDuration = config.STUN_DURATION;
        this.speed = config.SPEED;

        /** 存活計時 */
        this.lifetime = 0;
        this.maxLifetime = randomRange(4, 7);

        /** 飛行目標 */
        this.targetPosition = {
            x: randomRange(100, CANVAS_WIDTH - 100),
            y: randomRange(100, CANVAS_HEIGHT - 100),
        };

        /** 翅膀計時 */
        this.wingTimer = Math.random() * Math.PI * 2;

        /** 搖擺計時 */
        this.wobbleTimer = Math.random() * Math.PI * 2;

        /** 被擊中時的反應動畫 */
        this._angryTimer = 0;

        /** 蜜蜂身體搖擺 */
        this._wobbleX = 0;
        this._wobbleY = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;

        this.lifetime += deltaTime;
        this.wingTimer += deltaTime * 30;
        this.wobbleTimer += deltaTime * 2.5;

        // 自動離場
        if (this.lifetime >= this.maxLifetime) {
            this.isAlive = false;
            this._escaped = true;
            return;
        }

        // 飛行移動
        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            // 到達目標，選新目標
            this.targetPosition = {
                x: randomRange(100, CANVAS_WIDTH - 100),
                y: randomRange(100, CANVAS_HEIGHT - 100),
            };
        } else {
            const moveSpeed = this.speed * 50 * deltaTime;
            this._wobbleX = Math.sin(this.wobbleTimer * 3) * 30 * deltaTime;
            this._wobbleY = Math.cos(this.wobbleTimer * 2.5) * 20 * deltaTime;
            this.x += (dx / dist) * moveSpeed + this._wobbleX;
            this.y += (dy / dist) * moveSpeed + this._wobbleY;
        }

        // 生氣動畫衰減
        if (this._angryTimer > 0) {
            this._angryTimer -= deltaTime;
        }
    }

    render(renderer) {
        if (!this.isAlive) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const isAngry = this._angryTimer > 0;

        renderer.save();
        const ctx = renderer.ctx;

        // 翅膀
        const wingSpread = Math.sin(this.wingTimer) * 10;
        ctx.fillStyle = 'rgba(230, 230, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(cx - 14 - wingSpread, cy - 8, 11, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 14 + wingSpread, cy - 8, 11, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 身體（黃黑條紋）
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 黑色條紋
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 10, cy - 4, 20, 3);
        ctx.fillRect(cx - 9, cy + 3, 18, 3);
        ctx.fillRect(cx - 8, cy + 9, 16, 3);

        // 頭（圓形，黑色）
        renderer.drawCircle(cx, cy - 16, 7, '#333');

        // 眼睛
        renderer.drawCircle(cx - 3, cy - 17, 2.5, isAngry ? '#ff0000' : '#ffffff');
        renderer.drawCircle(cx + 3, cy - 17, 2.5, isAngry ? '#ff0000' : '#ffffff');
        renderer.drawCircle(cx - 3, cy - 17, 1.2, '#000');
        renderer.drawCircle(cx + 3, cy - 17, 1.2, '#000');

        // 觸角
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 22);
        ctx.lineTo(cx - 7, cy - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy - 22);
        ctx.lineTo(cx + 7, cy - 30);
        ctx.stroke();

        // 尾刺
        ctx.strokeStyle = '#aa3300';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 14);
        ctx.lineTo(cx, cy + 22);
        ctx.stroke();

        // 生氣效果
        if (isAngry) {
            renderer.setAlpha(0.4);
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💢', cx + 15, cy - 20);
            renderer.resetAlpha();
        }

        // ⚠️ 警告標誌（讓玩家辨識）
        renderer.setAlpha(0.4 + Math.sin(this.wobbleTimer * 4) * 0.2);
        ctx.fillStyle = '#ffaa00';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐝', cx, cy - 35);
        renderer.resetAlpha();

        renderer.restore();
    }

    /**
     * 被玩家誤擊時觸發
     * @param {import('./PlayerState.js').PlayerState} playerState
     * @returns {{hpPenalty: number, stunDuration: number}}
     */
    onHit(playerState) {
        this._angryTimer = 1.0;

        playerState.takeDamage(this.penaltyHp);
        playerState.applyStun(this.stunDuration);

        return {
            hpPenalty: this.penaltyHp,
            stunDuration: this.stunDuration,
        };
    }

    /** 蜜蜂不會吸血 */
    getBloodDrain() {
        return 0;
    }

    /** 蜜蜂逃走不扣血 */
    hasEscaped() {
        return false;
    }

    calculateScore() {
        return 0; // 不給分
    }
}
