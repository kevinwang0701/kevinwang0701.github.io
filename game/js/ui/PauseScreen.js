/**
 * PauseScreen.js — 暫停畫面（Phase 2 基本版）
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';
import { pointInRect } from '../utils/CollisionUtils.js?v=3';

export class PauseScreen {
    constructor(game) {
        this.game = game;

        this.resumeButton = {
            x: CANVAS_WIDTH / 2 - 130,
            y: CANVAS_HEIGHT / 2 + 10,
            width: 260,
            height: 55,
            text: '▶️ 繼續遊戲',
            isHovered: false,
        };

        this.quitButton = {
            x: CANVAS_WIDTH / 2 - 130,
            y: CANVAS_HEIGHT / 2 + 80,
            width: 260,
            height: 55,
            text: '🏠 回主選單',
            isHovered: false,
        };
    }

    init() {}

    update(deltaTime) {
        const cursor = this.game.input.cursorPosition;
        for (const btn of [this.resumeButton, this.quitButton]) {
            btn.isHovered = pointInRect(cursor.x, cursor.y, btn.x, btn.y, btn.width, btn.height);
        }
    }

    render(renderer) {
        renderer.setAlpha(0.7);
        renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000');
        renderer.resetAlpha();

        renderer.drawTextWithStroke(
            '⏸ 暫停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60,
            '#fff', '#000',
            'bold 56px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            5, 'center', 'middle'
        );

        for (const btn of [this.resumeButton, this.quitButton]) {
            const color = btn.isHovered ? '#555' : '#333';
            renderer.drawRoundRect(btn.x, btn.y, btn.width, btn.height, 10, color);
            renderer.drawRoundRectStroke(btn.x, btn.y, btn.width, btn.height, 10, '#888', 2);
            renderer.drawTextWithStroke(
                btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2,
                '#fff', '#000',
                'bold 22px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                3, 'center', 'middle'
            );
        }
    }

    handleClick(x, y) {
        if (pointInRect(x, y, this.resumeButton.x, this.resumeButton.y, this.resumeButton.width, this.resumeButton.height)) {
            return 'resume';
        }
        if (pointInRect(x, y, this.quitButton.x, this.quitButton.y, this.quitButton.width, this.quitButton.height)) {
            return 'menu';
        }
        return null;
    }
}
