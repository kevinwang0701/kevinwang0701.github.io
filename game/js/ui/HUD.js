/**
 * HUD.js — 遊戲中的抬頭顯示器
 *
 * 繪製 HP 條、分數、Combo、波次資訊、浮動得分文字。
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';
import { clamp } from '../utils/MathUtils.js?v=3';

export class HUD {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.showFPS = true; // Debug 模式

        /** 浮動文字列表 */
        this._floatingTexts = [];

        /** 顯示用的 HP（平滑過渡） */
        this._displayHP = 100;

        /** 顯示用的分數（計數動畫） */
        this._displayScore = 0;

        /** 受傷時的螢幕閃紅計時 */
        this._damageFlashTimer = 0;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const player = this.game.player;

        // HP 平滑過渡
        this._displayHP += (player.hp - this._displayHP) * deltaTime * 8;

        // 分數計數動畫
        if (this._displayScore < player.score) {
            this._displayScore += Math.ceil((player.score - this._displayScore) * deltaTime * 5);
            if (this._displayScore > player.score) this._displayScore = player.score;
        }

        // 受傷閃紅
        if (this._damageFlashTimer > 0) {
            this._damageFlashTimer -= deltaTime;
        }

        // 更新浮動文字
        for (let i = this._floatingTexts.length - 1; i >= 0; i--) {
            const ft = this._floatingTexts[i];
            ft.y -= 60 * deltaTime;
            ft.timer -= deltaTime;
            ft.alpha = clamp(ft.timer / ft.maxTimer, 0, 1);
            if (ft.timer <= 0) {
                this._floatingTexts.splice(i, 1);
            }
        }
    }

    /**
     * @param {import('../core/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        this._drawHPBar(renderer);
        this._drawScore(renderer);
        this._drawCombo(renderer);
        this._drawWaveInfo(renderer);
        this._drawFloatingTexts(renderer);
        this._drawDamageFlash(renderer);

        if (this.showFPS) {
            this._drawFPS(renderer);
        }
    }

    /** @private */
    _drawHPBar(renderer) {
        const player = this.game.player;
        const barX = 30;
        const barY = 30;
        const barW = 300;
        const barH = 28;
        const hpRatio = clamp(this._displayHP / player.maxHp, 0, 1);

        // 背景
        renderer.drawRoundRect(barX - 2, barY - 2, barW + 4, barH + 4, 6, 'rgba(0,0,0,0.6)');

        // HP 條漸變色
        let color;
        if (hpRatio > 0.6) {
            color = `hsl(${120 * hpRatio}, 80%, 50%)`;
        } else if (hpRatio > 0.3) {
            color = `hsl(${120 * hpRatio}, 90%, 50%)`;
        } else {
            color = `hsl(0, 90%, 50%)`;
        }

        renderer.drawRoundRect(barX, barY, barW * hpRatio, barH, 4, color);

        // HP 條高光
        renderer.setAlpha(0.3);
        renderer.drawRoundRect(barX, barY, barW * hpRatio, barH / 2, 4, '#fff');
        renderer.resetAlpha();

        // HP 文字
        renderer.drawTextWithStroke(
            `${Math.ceil(this._displayHP)} / ${player.maxHp}`,
            barX + barW / 2, barY + barH / 2,
            '#fff', '#000',
            'bold 16px "Segoe UI", Arial, sans-serif',
            3, 'center', 'middle'
        );

        // ❤️ 圖示
        renderer.drawText('❤️', barX - 2, barY - 4, '#ff4444', '22px Arial', 'right', 'top');
    }

    /** @private */
    _drawScore(renderer) {
        const scoreText = `${this._displayScore.toLocaleString()}`;
        renderer.drawTextWithStroke(
            `🏆 ${scoreText}`,
            CANVAS_WIDTH - 30, 35,
            '#ffd700', '#000',
            'bold 30px "Segoe UI", Arial, sans-serif',
            4, 'right', 'top'
        );
    }

    /** @private */
    _drawCombo(renderer) {
        const combo = this.game.comboSystem;
        if (combo.count <= 0) return;

        const cx = CANVAS_WIDTH / 2;
        const cy = 60;

        const scale = combo.displayScale;
        const shakeX = (Math.random() - 0.5) * combo.shakeAmount;
        const shakeY = (Math.random() - 0.5) * combo.shakeAmount;

        renderer.save();
        renderer.ctx.translate(cx + shakeX, cy + shakeY);
        renderer.ctx.scale(scale, scale);

        // Combo 數字
        const comboColor = combo.count >= 20 ? '#ff4444' :
                          combo.count >= 10 ? '#ff8800' :
                          combo.count >= 5 ? '#ffcc00' : '#ffffff';

        renderer.drawTextWithStroke(
            `${combo.count} COMBO`,
            0, 0,
            comboColor, '#000',
            `bold ${Math.min(36 + combo.count, 56)}px "Segoe UI", Arial, sans-serif`,
            5, 'center', 'middle'
        );

        // 倍率
        if (combo.multiplier > 1) {
            renderer.drawTextWithStroke(
                `x${combo.multiplier.toFixed(1)}`,
                0, 30,
                '#88ff88', '#000',
                'bold 22px "Segoe UI", Arial, sans-serif',
                3, 'center', 'middle'
            );
        }

        renderer.restore();
    }

    /** @private */
    _drawWaveInfo(renderer) {
        const wave = this.game.waveManager;
        if (!wave.isActive) return;

        if (wave.isBreak) {
            renderer.drawTextWithStroke(
                `第 ${wave.currentWave + 1} 波即將到來...`,
                CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50,
                '#88ccff', '#000',
                'bold 36px "Segoe UI", Arial, sans-serif',
                4, 'center', 'middle'
            );
        } else {
            renderer.drawTextWithStroke(
                `Wave ${wave.currentWave}`,
                CANVAS_WIDTH - 30, 80,
                '#88ccff', '#000',
                '20px "Segoe UI", Arial, sans-serif',
                3, 'right', 'top'
            );
            renderer.drawText(
                `剩餘: ${wave.remainingEnemies}`,
                CANVAS_WIDTH - 30, 105,
                'rgba(255,255,255,0.7)',
                '16px "Segoe UI", Arial, sans-serif',
                'right', 'top'
            );
        }
    }

    /** @private */
    _drawFloatingTexts(renderer) {
        for (const ft of this._floatingTexts) {
            renderer.setAlpha(ft.alpha);
            renderer.drawTextWithStroke(
                ft.text,
                ft.x, ft.y,
                ft.color, '#000',
                `bold ${ft.size}px "Segoe UI", Arial, sans-serif`,
                3, 'center', 'middle'
            );
            renderer.resetAlpha();
        }
    }

    /** @private */
    _drawDamageFlash(renderer) {
        if (this._damageFlashTimer > 0) {
            const alpha = this._damageFlashTimer * 0.4;
            renderer.setAlpha(alpha);
            renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'rgba(255, 0, 0, 0.3)');
            renderer.resetAlpha();
        }
    }

    /** @private */
    _drawFPS(renderer) {
        renderer.drawText(
            `FPS: ${this.game.gameLoop.currentFPS}`,
            10, CANVAS_HEIGHT - 25,
            'rgba(255,255,255,0.4)',
            '14px monospace',
            'left', 'top'
        );
    }

    /**
     * 顯示浮動得分文字
     * @param {number} score
     * @param {number} x
     * @param {number} y
     */
    showFloatingScore(score, x, y) {
        this._floatingTexts.push({
            text: `+${score}`,
            x,
            y,
            color: score >= 30 ? '#ffcc00' : '#ffffff',
            size: Math.min(20 + score / 3, 36),
            alpha: 1,
            timer: 1.0,
            maxTimer: 1.0,
        });
    }

    /** 觸發受傷螢幕閃紅 */
    triggerDamageFlash() {
        this._damageFlashTimer = 0.3;
    }
}
