/**
 * Mosquito.js — 普通蚊子
 *
 * 行為狀態機：flying → landing → feeding → leaving
 * 停留吸血越久分數越高，但飛走會扣玩家 HP。
 */

import { Entity } from './Entity.js?v=2';
import { ENEMY_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange, randomInt, distance, angle, lerp } from '../utils/MathUtils.js?v=2';

export class Mosquito extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y, 40, 40);

        const config = ENEMY_CONFIG.MOSQUITO;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.speed = config.SPEED;
        this.baseScore = config.SCORE;
        this.bloodDrainRate = config.BLOOD_DRAIN_RATE;

        /** 已吸血累計時間（秒） */
        this.feedingTime = 0;

        /** 是否正在吸血 */
        this.isFeeding = false;

        /** 行為狀態 */
        this.behavior = 'flying'; // flying | landing | feeding | leaving

        /** 飛行目標位置 */
        this.targetPosition = { x: 0, y: 0 };

        /** 停留時間上限（秒），超過後離場 */
        this.maxFeedingTime = randomRange(3, 7);

        /** 飛行到目標後是否降落 */
        this.shouldLand = true;

        /** 翅膀振動用計時器 */
        this.wingTimer = Math.random() * Math.PI * 2;

        /** 身體搖擺用計時器 */
        this.wobbleTimer = Math.random() * Math.PI * 2;

        /** 降落動畫進度 */
        this._landingProgress = 0;

        // 初始化飛行目標
        this._pickNewTarget();
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;

        this.wingTimer += deltaTime * 25;
        this.wobbleTimer += deltaTime * 3;

        switch (this.behavior) {
            case 'flying':
                this._updateFlying(deltaTime);
                break;
            case 'landing':
                this._updateLanding(deltaTime);
                break;
            case 'feeding':
                this._updateFeeding(deltaTime);
                break;
            case 'leaving':
                this._updateLeaving(deltaTime);
                break;
        }
    }

    /** @private */
    _updateFlying(deltaTime) {
        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            // 到達目標
            if (this.shouldLand) {
                this.behavior = 'landing';
                this._landingProgress = 0;
            } else {
                this._pickNewTarget();
            }
            return;
        }

        // 朝目標移動，附帶微幅搖擺
        const moveSpeed = this.speed * 60 * deltaTime;
        const wobbleX = Math.sin(this.wobbleTimer) * 20 * deltaTime;
        const wobbleY = Math.cos(this.wobbleTimer * 1.3) * 15 * deltaTime;

        this.x += (dx / dist) * moveSpeed + wobbleX;
        this.y += (dy / dist) * moveSpeed + wobbleY;
    }

    /** @private */
    _updateLanding(deltaTime) {
        this._landingProgress += deltaTime * 2;
        if (this._landingProgress >= 1) {
            this.behavior = 'feeding';
            this.isFeeding = true;
        }
    }

    /** @private */
    _updateFeeding(deltaTime) {
        this.feedingTime += deltaTime;

        // 微幅顫動（正在吸血的感覺）
        this.x += Math.sin(this.wobbleTimer * 5) * 0.3;
        this.y += Math.cos(this.wobbleTimer * 4) * 0.2;

        // 超過停留時間，準備離場
        if (this.feedingTime >= this.maxFeedingTime) {
            this.behavior = 'leaving';
            this.isFeeding = false;
            // 離場目標：飛出畫面
            const edge = randomInt(0, 3);
            switch (edge) {
                case 0: this.targetPosition = { x: randomRange(0, CANVAS_WIDTH), y: -80 }; break;
                case 1: this.targetPosition = { x: CANVAS_WIDTH + 80, y: randomRange(0, CANVAS_HEIGHT) }; break;
                case 2: this.targetPosition = { x: randomRange(0, CANVAS_WIDTH), y: CANVAS_HEIGHT + 80 }; break;
                case 3: this.targetPosition = { x: -80, y: randomRange(0, CANVAS_HEIGHT) }; break;
            }
        }
    }

    /** @private */
    _updateLeaving(deltaTime) {
        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const moveSpeed = this.speed * 80 * deltaTime; // 離場時加速
        this.x += (dx / dist) * moveSpeed;
        this.y += (dy / dist) * moveSpeed;

        // 飛出畫面範圍後標記死亡（不算擊殺）
        if (this.x < -100 || this.x > CANVAS_WIDTH + 100 ||
            this.y < -100 || this.y > CANVAS_HEIGHT + 100) {
            this.isAlive = false;
            this._escaped = true; // 標記為逃走（需扣血）
        }
    }

    /**
     * @param {import('../core/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        if (!this.isAlive) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 被擊中閃爍
        if (this._isFlashing) {
            renderer.setAlpha(0.5);
        }

        // ── 繪製蚊子 ──
        renderer.save();

        // 翅膀
        const wingSpread = Math.sin(this.wingTimer) * 12;
        const wingY = cy - 5;

        // 左翅
        renderer.ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
        renderer.ctx.beginPath();
        renderer.ctx.ellipse(cx - 15 - wingSpread, wingY, 14, 8, -0.3, 0, Math.PI * 2);
        renderer.ctx.fill();

        // 右翅
        renderer.ctx.beginPath();
        renderer.ctx.ellipse(cx + 15 + wingSpread, wingY, 14, 8, 0.3, 0, Math.PI * 2);
        renderer.ctx.fill();

        // 身體
        renderer.ctx.fillStyle = '#3a3a3a';
        renderer.ctx.beginPath();
        renderer.ctx.ellipse(cx, cy, 8, 14, 0, 0, Math.PI * 2);
        renderer.ctx.fill();

        // 頭部
        renderer.ctx.fillStyle = '#2a2a2a';
        renderer.drawCircle(cx, cy - 16, 6, '#2a2a2a');

        // 吸管（口器）
        renderer.drawLine(cx, cy - 22, cx, cy - 32, '#555', 1.5);

        // 腳（6隻）
        renderer.ctx.strokeStyle = '#555';
        renderer.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const legY = cy - 2 + i * 7;
            // 左腳
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(cx - 8, legY);
            renderer.ctx.lineTo(cx - 22, legY + 8);
            renderer.ctx.stroke();
            // 右腳
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(cx + 8, legY);
            renderer.ctx.lineTo(cx + 22, legY + 8);
            renderer.ctx.stroke();
        }

        // 吸血中的效果：身體變紅
        if (this.isFeeding && this.feedingTime > 0.5) {
            const redAmount = Math.min(this.feedingTime / this.maxFeedingTime, 1);
            renderer.ctx.fillStyle = `rgba(180, 30, 30, ${redAmount * 0.6})`;
            renderer.ctx.beginPath();
            renderer.ctx.ellipse(cx, cy + 2, 6, 10, 0, 0, Math.PI * 2);
            renderer.ctx.fill();
        }

        renderer.restore();

        if (this._isFlashing) {
            renderer.resetAlpha();
        }
    }

    /**
     * 計算擊殺得分（吸血越久分數越高）
     * @returns {number}
     */
    calculateScore() {
        const feedingBonus = Math.floor(this.feedingTime * 5);
        return this.baseScore + feedingBonus;
    }

    /** 是否是逃走的（需扣玩家血） */
    hasEscaped() {
        return this._escaped === true;
    }

    /**
     * 取得每秒對玩家造成的吸血傷害
     * @returns {number}
     */
    getBloodDrain() {
        return this.isFeeding ? this.bloodDrainRate : 0;
    }

    /** @private */
    _pickNewTarget() {
        // 選擇畫面內的隨機目標位置（留邊距）
        const margin = 100;
        this.targetPosition = {
            x: randomRange(margin, CANVAS_WIDTH - margin),
            y: randomRange(margin, CANVAS_HEIGHT - margin),
        };
    }
}
