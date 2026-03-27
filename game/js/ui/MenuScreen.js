/**
 * MenuScreen.js — 主選單畫面
 *
 * 遊戲標題動畫 + 開始按鈕 + 背景裝飾蚊子
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { randomRange } from '../utils/MathUtils.js?v=2';
import { pointInRect } from '../utils/CollisionUtils.js?v=2';

export class MenuScreen {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;
        this.animationTimer = 0;

        /** 按鈕定義 */
        this.startButton = {
            x: CANVAS_WIDTH / 2 - 160,
            y: CANVAS_HEIGHT / 2 + 60,
            width: 320,
            height: 70,
            text: '🎮 開始遊戲',
            isHovered: false,
        };

        /** 背景裝飾蚊子 */
        this._bgMosquitoes = [];
        for (let i = 0; i < 8; i++) {
            this._bgMosquitoes.push({
                x: randomRange(0, CANVAS_WIDTH),
                y: randomRange(0, CANVAS_HEIGHT),
                vx: randomRange(-60, 60),
                vy: randomRange(-40, 40),
                wingTimer: Math.random() * Math.PI * 2,
                size: randomRange(15, 30),
            });
        }

        /** 標題呼吸動畫 */
        this._titleScale = 1.0;
    }

    init() {
        // 已在 constructor 初始化
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.animationTimer += deltaTime;

        // 標題呼吸
        this._titleScale = 1.0 + Math.sin(this.animationTimer * 2) * 0.03;

        // 更新背景蚊子位置
        for (const m of this._bgMosquitoes) {
            m.x += m.vx * deltaTime;
            m.y += m.vy * deltaTime;
            m.wingTimer += deltaTime * 20;

            // 超出邊界則反彈
            if (m.x < -20 || m.x > CANVAS_WIDTH + 20) m.vx *= -1;
            if (m.y < -20 || m.y > CANVAS_HEIGHT + 20) m.vy *= -1;
        }

        // 按鈕 hover
        const cursor = this.game.input.cursorPosition;
        const btn = this.startButton;
        btn.isHovered = pointInRect(cursor.x, cursor.y, btn.x, btn.y, btn.width, btn.height);
    }

    /**
     * @param {import('../core/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        // ── 背景漸層 ──
        const ctx = renderer.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#1a1a3e');
        gradient.addColorStop(1, '#0d0d1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ── 背景裝飾蚊子 ──
        renderer.setAlpha(0.15);
        for (const m of this._bgMosquitoes) {
            const ws = Math.sin(m.wingTimer) * 6;
            // 簡化的蚊子剪影
            renderer.drawCircle(m.x, m.y, m.size * 0.4, '#aaa');
            renderer.drawCircle(m.x - m.size * 0.5 - ws, m.y - 2, m.size * 0.3, '#888');
            renderer.drawCircle(m.x + m.size * 0.5 + ws, m.y - 2, m.size * 0.3, '#888');
        }
        renderer.resetAlpha();

        // ── 標題 ──
        renderer.save();
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
        ctx.scale(this._titleScale, this._titleScale);

        // 標題光暈
        renderer.setAlpha(0.3);
        renderer.drawText(
            '🦟 狂熱打蚊子 🦟', 2, 2,
            '#ff4400',
            'bold 72px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            'center', 'middle'
        );
        renderer.resetAlpha();

        renderer.drawTextWithStroke(
            '🦟 狂熱打蚊子 🦟', 0, 0,
            '#ff6633', '#000',
            'bold 72px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            6, 'center', 'middle'
        );

        // 副標題
        renderer.drawTextWithStroke(
            'Mosquito Frenzy', 0, 55,
            '#ffaa66', '#000',
            'italic 28px "Segoe UI", Arial, sans-serif',
            3, 'center', 'middle'
        );

        renderer.restore();

        // ── 開始按鈕 ──
        const btn = this.startButton;
        const btnColor = btn.isHovered ? '#ff5522' : '#cc3300';
        const btnGlow = btn.isHovered ? 8 : 0;

        // 按鈕光暈
        if (btnGlow > 0) {
            renderer.setAlpha(0.4);
            renderer.drawRoundRect(
                btn.x - btnGlow, btn.y - btnGlow,
                btn.width + btnGlow * 2, btn.height + btnGlow * 2,
                16, '#ff5522'
            );
            renderer.resetAlpha();
        }

        renderer.drawRoundRect(btn.x, btn.y, btn.width, btn.height, 12, btnColor);

        // 高光
        renderer.setAlpha(0.2);
        renderer.drawRoundRect(btn.x, btn.y, btn.width, btn.height / 2, 12, '#fff');
        renderer.resetAlpha();

        renderer.drawTextWithStroke(
            btn.text,
            btn.x + btn.width / 2, btn.y + btn.height / 2,
            '#fff', '#000',
            'bold 30px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            4, 'center', 'middle'
        );

        // ── 操作提示 ──
        const hintAlpha = 0.4 + Math.sin(this.animationTimer * 3) * 0.2;
        renderer.setAlpha(hintAlpha);
        renderer.drawText(
            '點擊蚊子來消滅牠們！小心別打到蜜蜂 🐝',
            CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80,
            '#aaa',
            '20px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            'center', 'middle'
        );
        renderer.resetAlpha();

        // 版本
        renderer.drawText(
            'v0.2 Phase 2',
            CANVAS_WIDTH - 15, CANVAS_HEIGHT - 15,
            'rgba(255,255,255,0.2)',
            '14px monospace',
            'right', 'bottom'
        );
    }

    /**
     * 處理點擊
     * @param {number} x
     * @param {number} y
     * @returns {string|null} 觸發的動作
     */
    handleClick(x, y) {
        const btn = this.startButton;
        if (pointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
            return 'start';
        }
        return null;
    }
}
