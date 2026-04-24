/**
 * SpecialMode.js — 特殊模式管理
 *
 * 關燈模式 + 狂熱時間
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';

export class SpecialMode {
    constructor(game) {
        this.game = game;

        // ── 關燈模式 ──
        this.isDarknessActive = false;
        this.lightRadius = 150;
        this._darknessTimer = 0;
        this._darknessDuration = 0;

        // ── 狂熱時間 ──
        this.isFrenzyActive = false;
        this.frenzyTimer = 0;
        this.frenzyDuration = 10;
        this.frenzyScoreMultiplier = 2.0;
        this._frenzyPulse = 0;
    }

    activateDarkness(duration = 15) {
        this.isDarknessActive = true;
        this._darknessTimer = duration;
        this._darknessDuration = duration;
    }

    deactivateDarkness() {
        this.isDarknessActive = false;
    }

    activateFrenzy() {
        this.isFrenzyActive = true;
        this.frenzyTimer = this.frenzyDuration;
        this._frenzyPulse = 0;
    }

    update(deltaTime) {
        // 關燈模式計時
        if (this.isDarknessActive) {
            this._darknessTimer -= deltaTime;
            if (this._darknessTimer <= 0) {
                this.deactivateDarkness();
            }
        }

        // 狂熱時間計時
        if (this.isFrenzyActive) {
            this.frenzyTimer -= deltaTime;
            this._frenzyPulse += deltaTime * 8;

            if (this.frenzyTimer <= 0) {
                this.isFrenzyActive = false;
            }
        }
    }

    render(renderer, cursorX, cursorY) {
        // 關燈模式遮罩
        if (this.isDarknessActive) {
            renderer.drawDarknessOverlay(cursorX, cursorY, this.lightRadius);

            // 倒數計時
            renderer.drawTextWithStroke(
                `🌙 關燈模式 ${Math.ceil(this._darknessTimer)}s`,
                CANVAS_WIDTH / 2, 50,
                '#aaddff', '#000',
                'bold 24px "Segoe UI", Arial, sans-serif',
                3, 'center', 'middle'
            );
        }

        // 狂熱時間邊框效果
        if (this.isFrenzyActive) {
            const pulse = Math.sin(this._frenzyPulse) * 0.15 + 0.2;
            const ctx = renderer.ctx;

            // 四邊發光
            renderer.setAlpha(pulse);
            const gradient = ctx.createLinearGradient(0, 0, 0, 40);
            gradient.addColorStop(0, '#ff4400');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, 40);

            const gradient2 = ctx.createLinearGradient(0, CANVAS_HEIGHT, 0, CANVAS_HEIGHT - 40);
            gradient2.addColorStop(0, '#ff4400');
            gradient2.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
            renderer.resetAlpha();

            // 狂熱文字
            const scale = 1 + Math.sin(this._frenzyPulse * 2) * 0.05;
            renderer.save();
            ctx.translate(CANVAS_WIDTH / 2, 100);
            ctx.scale(scale, scale);
            renderer.drawTextWithStroke(
                `🔥 狂熱時間！ ${Math.ceil(this.frenzyTimer)}s 🔥`,
                0, 0,
                '#ff6600', '#000',
                'bold 32px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                4, 'center', 'middle'
            );
            renderer.drawTextWithStroke(
                `分數 x${this.frenzyScoreMultiplier}`,
                0, 35,
                '#ffcc00', '#000',
                'bold 22px "Segoe UI", Arial, sans-serif',
                3, 'center', 'middle'
            );
            renderer.restore();
        }
    }

    /** 取得目前的分數倍率加成 */
    getScoreMultiplier() {
        return this.isFrenzyActive ? this.frenzyScoreMultiplier : 1.0;
    }

    reset() {
        this.isDarknessActive = false;
        this._darknessTimer = 0;
        this.isFrenzyActive = false;
        this.frenzyTimer = 0;
    }
}
