/**
 * Renderer.js — 繪圖渲染器
 *
 * 封裝 Canvas 2D Context，所有繪製操作使用邏輯座標（1920×1080）。
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';

export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 設定邏輯解析度
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
    }

    /** 清除整個畫布 */
    clear() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    /** 填滿整個背景 */
    fillBackground(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    /** 繪製填色矩形 */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    /** 繪製矩形邊框 */
    drawRectStroke(x, y, width, height, color, lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }

    /** 繪製圓角矩形（安全版，處理 0 寬/高） */
    drawRoundRect(x, y, width, height, radius, color) {
        if (width <= 0 || height <= 0) return;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this._roundRectPath(x, y, width, height, radius);
        this.ctx.fill();
    }

    /** 繪製圓角矩形邊框 */
    drawRoundRectStroke(x, y, width, height, radius, color, lineWidth = 2) {
        if (width <= 0 || height <= 0) return;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this._roundRectPath(x, y, width, height, radius);
        this.ctx.stroke();
    }

    /** 安全的 roundRect path 繪製（含 fallback） @private */
    _roundRectPath(x, y, w, h, r) {
        if (this.ctx.roundRect) {
            this.ctx.roundRect(x, y, w, h, r);
        } else {
            // 手動繪製圓角矩形（polyfill fallback）
            const radius = Math.min(r, w / 2, h / 2);
            this.ctx.moveTo(x + radius, y);
            this.ctx.arcTo(x + w, y, x + w, y + h, radius);
            this.ctx.arcTo(x + w, y + h, x, y + h, radius);
            this.ctx.arcTo(x, y + h, x, y, radius);
            this.ctx.arcTo(x, y, x + w, y, radius);
            this.ctx.closePath();
        }
    }

    /** 繪製填色圓形 */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /** 繪製圓形邊框 */
    drawCircleStroke(x, y, radius, color, lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /** 繪製圖片 */
    drawImage(image, x, y, width, height) {
        this.ctx.drawImage(image, x, y, width, height);
    }

    /** 繪製精靈圖裁切 */
    drawSprite(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /** 繪製文字 */
    drawText(text, x, y, color, font, align = 'left', baseline = 'top') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
    }

    /** 繪製帶描邊的文字 */
    drawTextWithStroke(text, x, y, fillColor, strokeColor, font, strokeWidth = 4, align = 'left', baseline = 'top') {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.strokeText(text, x, y);
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    /** 繪製線段 */
    drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    /** 設定全域透明度 */
    setAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    /** 重置全域透明度 */
    resetAlpha() {
        this.ctx.globalAlpha = 1.0;
    }

    /** 儲存 context 狀態 */
    save() {
        this.ctx.save();
    }

    /** 恢復 context 狀態 */
    restore() {
        this.ctx.restore();
    }

    /** 繪製漸層矩形 */
    drawGradientRect(x, y, width, height, colorStops) {
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
        colorStops.forEach(([offset, color]) => {
            gradient.addColorStop(offset, color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
    }

    /**
     * 繪製「關燈模式」遮罩
     * 全螢幕黑色遮罩，僅指定位置有圓形光暈
     */
    drawDarknessOverlay(x, y, radius) {
        this.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 用 destination-out 挖掉光暈區域
        this.ctx.globalCompositeOperation = 'destination-out';
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.globalCompositeOperation = 'source-over';
        this.restore();
    }

    /** 測量文字寬度 */
    measureText(text, font) {
        this.ctx.font = font;
        return this.ctx.measureText(text).width;
    }
}
