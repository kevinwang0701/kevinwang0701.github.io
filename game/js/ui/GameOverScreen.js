/**
 * GameOverScreen.js — 遊戲結束畫面
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { pointInRect } from '../utils/CollisionUtils.js?v=2';

export class GameOverScreen {
    /**
     * @param {import('../core/Game.js').Game} game
     */
    constructor(game) {
        this.game = game;

        this.retryButton = {
            x: CANVAS_WIDTH / 2 - 260,
            y: CANVAS_HEIGHT / 2 + 140,
            width: 230,
            height: 60,
            text: '🔄 再來一局',
            isHovered: false,
        };

        this.menuButton = {
            x: CANVAS_WIDTH / 2 + 30,
            y: CANVAS_HEIGHT / 2 + 140,
            width: 230,
            height: 60,
            text: '🏠 回主選單',
            isHovered: false,
        };

        this.stats = {
            finalScore: 0,
            maxCombo: 0,
            wavesCleared: 0,
            enemiesKilled: 0,
        };

        this._animTimer = 0;
        this._fadeIn = 0;
    }

    init() {}

    /**
     * @param {Object} stats
     */
    setStats(stats) {
        this.stats = { ...this.stats, ...stats };
        this._animTimer = 0;
        this._fadeIn = 0;
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this._animTimer += deltaTime;
        this._fadeIn = Math.min(1, this._fadeIn + deltaTime * 2);

        const cursor = this.game.input.cursorPosition;
        for (const btn of [this.retryButton, this.menuButton]) {
            btn.isHovered = pointInRect(cursor.x, cursor.y, btn.x, btn.y, btn.width, btn.height);
        }
    }

    /**
     * @param {import('../core/Renderer.js').Renderer} renderer
     */
    render(renderer) {
        // 半透明遮罩
        renderer.setAlpha(this._fadeIn * 0.8);
        renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000');
        renderer.resetAlpha();
        renderer.setAlpha(this._fadeIn);

        // Game Over 標題
        renderer.drawTextWithStroke(
            '💀 GAME OVER 💀',
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 130,
            '#ff4444', '#000',
            'bold 64px "Segoe UI", Arial, sans-serif',
            6, 'center', 'middle'
        );

        // 結算數據
        const stats = this.stats;
        const statY = CANVAS_HEIGHT / 2 - 40;
        const statLines = [
            { label: '最終分數', value: stats.finalScore.toLocaleString(), color: '#ffd700' },
            { label: '最高連擊', value: `${stats.maxCombo} Combo`, color: '#ff8800' },
            { label: '存活波次', value: `${stats.wavesCleared}`, color: '#88ccff' },
            { label: '擊殺數', value: `${stats.enemiesKilled}`, color: '#88ff88' },
        ];

        statLines.forEach((line, i) => {
            renderer.drawText(
                line.label,
                CANVAS_WIDTH / 2 - 120, statY + i * 38,
                'rgba(255,255,255,0.7)',
                '22px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                'right', 'top'
            );
            renderer.drawTextWithStroke(
                line.value,
                CANVAS_WIDTH / 2 + 20, statY + i * 38,
                line.color, '#000',
                'bold 24px "Segoe UI", Arial, sans-serif',
                3, 'left', 'top'
            );
        });

        // 按鈕
        for (const btn of [this.retryButton, this.menuButton]) {
            const color = btn.isHovered ? '#555' : '#333';
            renderer.drawRoundRect(btn.x, btn.y, btn.width, btn.height, 10, color);
            renderer.drawRoundRectStroke(btn.x, btn.y, btn.width, btn.height, 10, '#888', 2);
            renderer.drawTextWithStroke(
                btn.text,
                btn.x + btn.width / 2, btn.y + btn.height / 2,
                '#fff', '#000',
                'bold 24px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                3, 'center', 'middle'
            );
        }

        renderer.resetAlpha();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {string|null}
     */
    handleClick(x, y) {
        if (pointInRect(x, y, this.retryButton.x, this.retryButton.y, this.retryButton.width, this.retryButton.height)) {
            return 'retry';
        }
        if (pointInRect(x, y, this.menuButton.x, this.menuButton.y, this.menuButton.width, this.menuButton.height)) {
            return 'menu';
        }
        return null;
    }
}
