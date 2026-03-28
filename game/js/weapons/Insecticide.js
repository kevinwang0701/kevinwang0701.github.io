/**
 * Insecticide.js — 殺蟲劑
 *
 * 全螢幕清場，秒殺所有蚊子（跳過陷阱）。
 * 有使用次數限制 + 噴灑動畫。
 */

import { Weapon } from './Weapon.js?v=2';
import { WEAPON_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';

export class Insecticide extends Weapon {
    constructor() {
        super('insecticide', '殺蟲劑');

        const config = WEAPON_CONFIG.INSECTICIDE;
        this.damage = config.DAMAGE;
        this.remainingUses = config.MAX_USES;
        this.maxUses = config.MAX_USES;

        /** 噴灑動畫 */
        this.isAnimating = false;
        this.animationTimer = 0;
        this.animationDuration = 1.5;

        /** 霧氣粒子 */
        this._fogParticles = [];
    }

    attack(x, y, enemies, currentTime) {
        if (this.remainingUses <= 0 || this.isAnimating) return [];

        this.remainingUses--;
        this.isAnimating = true;
        this.animationTimer = this.animationDuration;

        // 生成霧氣粒子
        this._fogParticles = [];
        for (let i = 0; i < 80; i++) {
            this._fogParticles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: CANVAS_HEIGHT + 20,
                targetY: Math.random() * CANVAS_HEIGHT,
                size: 30 + Math.random() * 60,
                alpha: 0,
                maxAlpha: 0.3 + Math.random() * 0.3,
                speed: 200 + Math.random() * 300,
                delay: Math.random() * 0.5,
            });
        }

        // 秒殺所有非陷阱敵人
        const hitEnemies = [];
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            if (enemy.isTrap) continue; // 跳過陷阱
            hitEnemies.push(enemy);
        }

        return hitEnemies;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.isAnimating) {
            this.animationTimer -= deltaTime;

            // 更新霧氣
            for (const p of this._fogParticles) {
                if (p.delay > 0) {
                    p.delay -= deltaTime;
                    continue;
                }

                // 上升
                p.y -= p.speed * deltaTime;
                if (p.y < p.targetY) {
                    p.y = p.targetY;
                }

                // 淡入淡出
                const progress = 1 - (this.animationTimer / this.animationDuration);
                if (progress < 0.3) {
                    p.alpha = p.maxAlpha * (progress / 0.3);
                } else if (progress > 0.7) {
                    p.alpha = p.maxAlpha * ((1 - progress) / 0.3);
                } else {
                    p.alpha = p.maxAlpha;
                }
            }

            if (this.animationTimer <= 0) {
                this.isAnimating = false;
                this._fogParticles = [];
            }
        }
    }

    render(renderer, cursorX, cursorY) {
        // 噴灑動畫
        if (this.isAnimating) {
            for (const p of this._fogParticles) {
                if (p.delay > 0) continue;
                renderer.setAlpha(p.alpha);
                renderer.drawCircle(p.x, p.y, p.size, '#88cc66');
                renderer.resetAlpha();
            }

            // 文字提示
            const progress = 1 - (this.animationTimer / this.animationDuration);
            if (progress < 0.6) {
                renderer.setAlpha(Math.min(1, progress * 3));
                renderer.drawTextWithStroke(
                    '💨 殺蟲劑噴灑中！',
                    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
                    '#88ff44', '#000',
                    'bold 48px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                    6, 'center', 'middle'
                );
                renderer.resetAlpha();
            }
        }

        // 殺蟲劑罐頭游標（僅在裝備時顯示）
        renderer.save();
        const ctx = renderer.ctx;
        ctx.translate(cursorX, cursorY);

        // 罐身
        ctx.fillStyle = this.remainingUses > 0 ? '#44aa44' : '#666';
        const rx = -12, ry = -25, rw = 24, rh = 40, rr = 4;
        ctx.beginPath();
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

        // 標籤
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('殺蟲', 0, -5);
        ctx.fillText('劑', 0, 7);

        // 噴頭
        ctx.fillStyle = '#888';
        ctx.fillRect(-4, -32, 8, 8);

        // 剩餘次數
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`×${this.remainingUses}`, 20, 10);

        renderer.restore();
    }

    addUses(amount) {
        this.remainingUses = Math.min(this.maxUses + 2, this.remainingUses + amount);
    }
}
