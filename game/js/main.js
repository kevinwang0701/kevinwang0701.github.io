/**
 * main.js — 遊戲進入點
 */

import { Game } from './core/Game.js?v=2';

function init() {
    try {
        const canvas = document.getElementById('game-canvas');

        if (!canvas) {
            console.error('找不到遊戲畫布元素 #game-canvas');
            return;
        }

        // roundRect polyfill（相容較舊的瀏覽器）
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
                const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
                const radius = Math.min(r, w / 2, h / 2);
                this.moveTo(x + radius, y);
                this.arcTo(x + w, y, x + w, y + h, radius);
                this.arcTo(x + w, y + h, x, y + h, radius);
                this.arcTo(x, y + h, x, y, radius);
                this.arcTo(x, y, x + w, y, radius);
                this.closePath();
            };
            console.log('ℹ️ roundRect polyfill applied');
        }

        const game = new Game(canvas);
        game.init();

        // Debug 用
        window.__game = game;

        console.log('🦟 《狂熱打蚊子》已啟動！');
    } catch (err) {
        console.error('🚨 遊戲初始化失敗:', err);
        // 在畫面上顯示錯誤訊息
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = 400;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 800, 400);
            ctx.fillStyle = '#ff4444';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('遊戲初始化失敗', 400, 150);
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.fillText(err.message, 400, 200);
            ctx.fillText(err.stack ? err.stack.split('\n')[1]?.trim() || '' : '', 400, 230);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
