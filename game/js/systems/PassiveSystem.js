/**
 * PassiveSystem.js — 被動道具系統
 *
 * 捕蚊燈：吸引附近蚊子並緩慢消滅
 * 青蛙：定時伸舌捕捉蚊子
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';
import { distance } from '../utils/MathUtils.js?v=3';

export class PassiveSystem {
    constructor(game) {
        this.game = game;
        this.items = [];
    }

    addItem(type, x, y) {
        const item = {
            type,
            x, y,
            timer: 0,
            _animTimer: 0,
        };

        if (type === 'mosquito_lamp') {
            item.range = 180;
            item.damageRate = 2; // 每秒傷害
            item.glowPhase = Math.random() * Math.PI * 2;
        } else if (type === 'frog') {
            item.attackInterval = 2.5;
            item.attackRange = 250;
            item.tongueTarget = null;
            item.tongueTimer = 0;
            item.tongueActive = false;
        }

        this.items.push(item);
    }

    update(deltaTime, enemies) {
        for (const item of this.items) {
            item._animTimer += deltaTime;

            if (item.type === 'mosquito_lamp') {
                this._updateLamp(item, deltaTime, enemies);
            } else if (item.type === 'frog') {
                this._updateFrog(item, deltaTime, enemies);
            }
        }
    }

    /** @private */
    _updateLamp(lamp, deltaTime, enemies) {
        lamp.glowPhase += deltaTime * 3;

        for (const enemy of enemies) {
            if (!enemy.isAlive || enemy.isTrap) continue;

            const dist = distance(lamp.x, lamp.y, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            if (dist < lamp.range) {
                // 吸引蚊子靠近
                const pull = 30 * deltaTime;
                const dx = lamp.x - (enemy.x + enemy.width / 2);
                const dy = lamp.y - (enemy.y + enemy.height / 2);
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                enemy.x += (dx / d) * pull;
                enemy.y += (dy / d) * pull;

                // 在範圍內持續造成傷害
                if (dist < lamp.range * 0.4) {
                    const dmg = lamp.damageRate * deltaTime;
                    enemy.takeDamage(dmg);
                }
            }
        }
    }

    /** @private */
    _updateFrog(frog, deltaTime, enemies) {
        if (frog.tongueActive) {
            frog.tongueTimer -= deltaTime;
            if (frog.tongueTimer <= 0) {
                frog.tongueActive = false;
                frog.tongueTarget = null;
            }
            return;
        }

        frog.timer += deltaTime;
        if (frog.timer >= frog.attackInterval) {
            frog.timer = 0;

            // 找最近的敵人
            let closest = null;
            let closestDist = Infinity;
            for (const enemy of enemies) {
                if (!enemy.isAlive || enemy.isTrap) continue;
                const dist = distance(frog.x, frog.y, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                if (dist < frog.attackRange && dist < closestDist) {
                    closestDist = dist;
                    closest = enemy;
                }
            }

            if (closest) {
                frog.tongueActive = true;
                frog.tongueTimer = 0.3;
                frog.tongueTarget = {
                    x: closest.x + closest.width / 2,
                    y: closest.y + closest.height / 2,
                };
                closest.takeDamage(999); // 一擊必殺
            }
        }
    }

    render(renderer) {
        for (const item of this.items) {
            if (item.type === 'mosquito_lamp') {
                this._renderLamp(item, renderer);
            } else if (item.type === 'frog') {
                this._renderFrog(item, renderer);
            }
        }
    }

    /** @private */
    _renderLamp(lamp, renderer) {
        const glow = 0.1 + Math.sin(lamp.glowPhase) * 0.05;

        // 光暈
        renderer.setAlpha(glow);
        renderer.drawCircle(lamp.x, lamp.y, lamp.range, '#aaddff');
        renderer.resetAlpha();

        // 吸引範圍
        renderer.setAlpha(0.15);
        renderer.drawCircleStroke(lamp.x, lamp.y, lamp.range, '#88ccff', 1);
        renderer.resetAlpha();

        // 燈體
        renderer.drawCircle(lamp.x, lamp.y, 15, '#4488cc');
        renderer.drawCircle(lamp.x, lamp.y, 10, '#88ccff');
        renderer.drawCircle(lamp.x, lamp.y, 5, '#ffffff');

        // 標籤
        renderer.drawText('💡', lamp.x - 10, lamp.y - 30, '#fff', '18px Arial', 'left', 'top');
    }

    /** @private */
    _renderFrog(frog, renderer) {
        const ctx = renderer.ctx;

        // 舌頭
        if (frog.tongueActive && frog.tongueTarget) {
            renderer.drawLine(frog.x, frog.y - 10, frog.tongueTarget.x, frog.tongueTarget.y, '#ff4466', 3);
            renderer.drawCircle(frog.tongueTarget.x, frog.tongueTarget.y, 5, '#ff6688');
        }

        // 身體
        ctx.fillStyle = '#44aa44';
        ctx.beginPath();
        ctx.ellipse(frog.x, frog.y, 20, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        renderer.drawCircle(frog.x - 8, frog.y - 12, 6, '#88cc44');
        renderer.drawCircle(frog.x + 8, frog.y - 12, 6, '#88cc44');
        renderer.drawCircle(frog.x - 8, frog.y - 12, 3, '#000');
        renderer.drawCircle(frog.x + 8, frog.y - 12, 3, '#000');

        // 嘴
        ctx.strokeStyle = '#226622';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(frog.x, frog.y, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 標籤
        renderer.drawText('🐸', frog.x - 10, frog.y + 20, '#fff', '16px Arial', 'left', 'top');
    }

    reset() {
        this.items = [];
    }
}
