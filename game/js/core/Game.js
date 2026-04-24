/**
 * Game.js — 遊戲主控類別
 *
 * 完整版：整合所有敵人/武器/系統/UI。
 */

import { GAME_STATES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';
import { GameLoop } from './GameLoop.js?v=3';
import { InputHandler } from './InputHandler.js?v=3';
import { Renderer } from './Renderer.js?v=3';
import { PlayerState } from '../entities/PlayerState.js?v=3';
import { ComboSystem } from '../systems/ComboSystem.js?v=3';
import { WaveManager } from '../systems/WaveManager.js?v=3';
import { UpgradeSystem } from '../systems/UpgradeSystem.js?v=3';
import { PassiveSystem } from '../systems/PassiveSystem.js?v=3';
import { SpecialMode } from '../systems/SpecialMode.js?v=3';
import { Swatter } from '../weapons/Swatter.js?v=3';
import { ElectricSwatter } from '../weapons/ElectricSwatter.js?v=3';
import { Insecticide } from '../weapons/Insecticide.js?v=3';
import { HUD } from '../ui/HUD.js?v=3';
import { MenuScreen } from '../ui/MenuScreen.js?v=3';
import { PauseScreen } from '../ui/PauseScreen.js?v=3';
import { GameOverScreen } from '../ui/GameOverScreen.js?v=3';
import { UpgradeShop } from '../ui/UpgradeShop.js?v=3';
import { pointInCircle } from '../utils/CollisionUtils.js?v=3';
import { Mosquito } from '../entities/Mosquito.js?v=3';

export class Game {
    constructor(canvas) {
        // ── 核心 ──
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.input = new InputHandler(canvas);
        this.gameLoop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        // ── 遊戲狀態 ──
        this.state = GAME_STATES.MENU;
        this.gameTime = 0;

        // ── 玩家 ──
        this.player = new PlayerState();

        // ── 武器 ──
        this.swatter = new Swatter();
        this.electricSwatter = new ElectricSwatter();
        this.insecticide = new Insecticide();
        this.currentWeapon = this.swatter;
        this._weaponIndex = 0;
        this._weapons = [this.swatter, this.electricSwatter, this.insecticide];

        // ── 系統 ──
        this.comboSystem = new ComboSystem();
        this.waveManager = new WaveManager(this);
        this.upgradeSystem = new UpgradeSystem();
        this.passiveSystem = new PassiveSystem(this);
        this.specialMode = new SpecialMode(this);

        // ── UI ──
        this.hud = new HUD(this);
        this.menuScreen = new MenuScreen(this);
        this.pauseScreen = new PauseScreen(this);
        this.gameOverScreen = new GameOverScreen(this);
        this.upgradeShop = new UpgradeShop(this);

        // ── 實體 ──
        this.enemies = [];
        this.currentBoss = null;

        // ── 背景星星 ──
        this._bgStars = [];
        for (let i = 0; i < 60; i++) {
            this._bgStars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                speed: Math.random() * 0.5 + 0.1,
            });
        }

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    init() {
        this.input.init();
        this.upgradeSystem.init();
        this.menuScreen.init();
        this.pauseScreen.init();
        this.gameOverScreen.init();
        this.upgradeShop.init();

        document.addEventListener('keydown', this._onKeyDown);

        this.gameLoop.start();
        console.log('🦟 Game initialized — Full version!');
    }

    update(deltaTime) {
        this.gameTime += deltaTime;

        switch (this.state) {
            case GAME_STATES.MENU:
                this._updateMenu(deltaTime);
                break;
            case GAME_STATES.PLAYING:
                this._updatePlaying(deltaTime);
                break;
            case GAME_STATES.PAUSED:
                this._updatePaused(deltaTime);
                break;
            case GAME_STATES.UPGRADE:
                this._updateUpgrade(deltaTime);
                break;
            case GAME_STATES.GAME_OVER:
                this._updateGameOver(deltaTime);
                break;
        }

        this.input.resetFrameState();
    }

    render() {
        this.renderer.clear();

        switch (this.state) {
            case GAME_STATES.MENU:
                this.menuScreen.render(this.renderer);
                break;
            case GAME_STATES.PLAYING:
                this._renderPlaying();
                break;
            case GAME_STATES.PAUSED:
                this._renderPlaying();
                this.pauseScreen.render(this.renderer);
                break;
            case GAME_STATES.UPGRADE:
                this._renderPlaying();
                this.upgradeShop.render(this.renderer);
                break;
            case GAME_STATES.GAME_OVER:
                this._renderPlaying();
                this.gameOverScreen.render(this.renderer);
                break;
        }
    }

    /** ─── 狀態更新 ─── */

    _updateMenu(deltaTime) {
        this.menuScreen.update(deltaTime);
        if (this.input.justPressed) {
            const action = this.menuScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'start') {
                this.startNewGame();
            }
        }
    }

    _updatePlaying(deltaTime) {
        this.player.update(deltaTime);
        this.comboSystem.update(deltaTime);
        this.currentWeapon.update(deltaTime);
        this.waveManager.update(deltaTime);
        this.specialMode.update(deltaTime);
        this.passiveSystem.update(deltaTime, this.enemies);

        // HP 自然回復
        if (this.player._hpRegen) {
            this.player.heal(this.player._hpRegen * deltaTime);
        }

        // 更新所有敵人
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Boss 邏輯
        if (this.currentBoss && this.currentBoss.isAlive) {
            // 召喚小怪
            if (this.currentBoss._shouldSpawnMinions) {
                const count = this.currentBoss.summonMinions();
                for (let i = 0; i < count; i++) {
                    const bossCenter = this.currentBoss.getCenter();
                    const mx = bossCenter.x + (Math.random() - 0.5) * 200;
                    const my = bossCenter.y + 100 + Math.random() * 100;
                    this.spawnEnemy(new Mosquito(mx, my));
                    this.waveManager.remainingEnemies++;
                }
            }
            // 發射毒液
            if (this.currentBoss._shouldShootVenom) {
                this.currentBoss.shootVenom(
                    this.input.cursorPosition.x,
                    this.input.cursorPosition.y
                );
            }
            // 毒液碰撞檢測
            this._checkVenomCollision();
        }

        // 蚊子吸血
        for (const enemy of this.enemies) {
            if (enemy.isAlive && enemy.getBloodDrain) {
                const drain = enemy.getBloodDrain() * deltaTime;
                if (drain > 0) {
                    this.player.takeDamage(drain);
                }
            }
        }

        // 電蚊拍持續攻擊（拖曳模式）
        if (this.currentWeapon.id === 'electric_swatter' && this.input.isPressed) {
            if (!this.currentWeapon.isActive) {
                this.currentWeapon.startUse();
            }
            const hitEnemies = this.currentWeapon.attack(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y,
                this.enemies, this.gameTime
            );
            this._processHits(hitEnemies);
        } else if (this.currentWeapon.id === 'electric_swatter' && !this.input.isPressed) {
            if (this.currentWeapon.isActive) {
                this.currentWeapon.stopUse();
            }
        }

        // 點擊攻擊（蒼蠅拍/殺蟲劑）
        if (this.input.justPressed && !this.player.isStunned) {
            if (this.currentWeapon.id !== 'electric_swatter') {
                this._handleAttack();
            }
        }

        // 清理
        this._cleanupEnemies();
        this.hud.update(deltaTime);

        // 升級商店觸發
        if (this.waveManager.showShop) {
            this.waveManager.showShop = false;
            this.upgradeShop.refresh();
            this.changeState(GAME_STATES.UPGRADE);
        }

        // 玩家死亡
        if (this.player.isDead()) {
            this.changeState(GAME_STATES.GAME_OVER);
        }

        // 狂熱觸發
        if (this.comboSystem.isFrenzyReady && !this.specialMode.isFrenzyActive) {
            this.specialMode.activateFrenzy();
            this.comboSystem.consumeFrenzy();
        }
    }

    _updatePaused(deltaTime) {
        this.pauseScreen.update(deltaTime);
        if (this.input.justPressed) {
            const action = this.pauseScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'resume') this.changeState(GAME_STATES.PLAYING);
            else if (action === 'menu') this.changeState(GAME_STATES.MENU);
        }
    }

    _updateUpgrade(deltaTime) {
        this.upgradeShop.update(deltaTime);
        if (this.input.justPressed) {
            const action = this.upgradeShop.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'continue') {
                this.changeState(GAME_STATES.PLAYING);
                this.waveManager.startNextWave();
            }
        }
    }

    _updateGameOver(deltaTime) {
        this.gameOverScreen.update(deltaTime);
        if (this.input.justPressed) {
            const action = this.gameOverScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'retry') this.startNewGame();
            else if (action === 'menu') this.changeState(GAME_STATES.MENU);
        }
    }

    /** ─── 繪圖 ─── */

    _renderPlaying() {
        this._drawGameBackground();

        // 被動道具
        this.passiveSystem.render(this.renderer);

        // 敵人
        for (const enemy of this.enemies) {
            enemy.render(this.renderer);
        }

        // 武器
        this.currentWeapon.render(
            this.renderer,
            this.input.cursorPosition.x,
            this.input.cursorPosition.y
        );

        // 僵直效果
        if (this.player.isStunned) {
            this.renderer.setAlpha(0.15 + Math.sin(this.gameTime * 20) * 0.1);
            this.renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#ff0000');
            this.renderer.resetAlpha();
        }

        // 特殊模式效果
        this.specialMode.render(
            this.renderer,
            this.input.cursorPosition.x,
            this.input.cursorPosition.y
        );

        // HUD
        this.hud.render(this.renderer);

        // 武器選擇提示
        this._drawWeaponSelector();
    }

    _drawGameBackground() {
        const ctx = this.renderer.ctx;
        const gradient = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
        );
        gradient.addColorStop(0, '#1e2040');
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        for (const star of this._bgStars) {
            const twinkle = Math.sin(this.gameTime * star.speed * 3 + star.x) * 0.3 + 0.7;
            this.renderer.setAlpha(star.alpha * twinkle);
            this.renderer.drawCircle(star.x, star.y, star.size, '#fff');
        }
        this.renderer.resetAlpha();

        this.renderer.setAlpha(0.03);
        const gridSize = 80;
        ctx.strokeStyle = '#446';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
        }
        this.renderer.resetAlpha();
    }

    _drawWeaponSelector() {
        const weapons = [
            { name: '蒼蠅拍', icon: '🪰', key: '1' },
            { name: '電蚊拍', icon: '⚡', key: '2' },
            { name: '殺蟲劑', icon: '💨', key: '3' },
        ];

        const startX = CANVAS_WIDTH / 2 - (weapons.length * 70) / 2;
        const y = CANVAS_HEIGHT - 50;

        for (let i = 0; i < weapons.length; i++) {
            const w = weapons[i];
            const x = startX + i * 70;
            const isSelected = i === this._weaponIndex;

            this.renderer.setAlpha(isSelected ? 1 : 0.4);
            this.renderer.drawRoundRect(x, y, 60, 40, 8,
                isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)');

            if (isSelected) {
                this.renderer.drawRoundRectStroke(x, y, 60, 40, 8, '#ffcc00', 2);
            }

            this.renderer.drawText(
                w.icon, x + 5, y + 5,
                '#fff', '20px Arial', 'left', 'top'
            );
            this.renderer.drawText(
                w.key, x + 45, y + 25,
                isSelected ? '#ffcc00' : '#888',
                'bold 14px monospace', 'center', 'top'
            );
            this.renderer.resetAlpha();
        }
    }

    /** ─── 遊戲邏輯 ─── */

    _handleAttack() {
        const { x, y } = this.input.cursorPosition;

        // 蒼蠅拍在冷卻中不應被當作「揮空」，直接忽略點擊
        if (this.currentWeapon.id === 'swatter' &&
            !this.currentWeapon.isReady(this.gameTime)) {
            return;
        }

        const hitEnemies = this.currentWeapon.attack(x, y, this.enemies, this.gameTime);
        this._processHits(hitEnemies);

        // 蒼蠅拍揮空
        if (hitEnemies.length === 0 && this.currentWeapon.id === 'swatter') {
            const stunDuration = this.comboSystem.onMiss();
            this.player.applyStun(stunDuration);
        }
    }

    _processHits(hitEnemies) {
        if (!hitEnemies || hitEnemies.length === 0) return;

        for (const enemy of hitEnemies) {
            // 陷阱處理
            if (enemy.isTrap) {
                enemy.onHit(this.player);
                this.hud.showFloatingScore(-enemy.penaltyHp, enemy.x + enemy.width / 2, enemy.y);
                this.hud.triggerDamageFlash();
                this.comboSystem.onMiss();
                continue;
            }

            const killed = enemy.takeDamage(this.currentWeapon.damage);
            if (killed) {
                const comboMult = this.comboSystem.onHit();
                const specialMult = this.specialMode.getScoreMultiplier();
                const score = enemy.calculateScore ? enemy.calculateScore() : 10;
                const finalScore = Math.floor(score * comboMult * specialMult);
                this.player.addScore(finalScore);
                this.player.enemiesKilled++;

                const center = enemy.getCenter();
                this.hud.showFloatingScore(finalScore, center.x, center.y);

                // Boss 擊殺
                if (enemy === this.currentBoss) {
                    this.currentBoss = null;
                }
            } else {
                this.comboSystem.onHit();
            }
        }
    }

    _checkVenomCollision() {
        if (!this.currentBoss) return;
        const { x, y } = this.input.cursorPosition;

        for (const v of this.currentBoss.venomProjectiles) {
            if (pointInCircle(x, y, v.x, v.y, 25)) {
                this.player.applyCursorInvert(3000);
                v.timer = 0; // 移除毒液
            }
        }
    }

    _cleanupEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive) {
                if (enemy.hasEscaped && enemy.hasEscaped()) {
                    const drain = (enemy.feedingTime || 0) * (enemy.bloodDrainRate || 0.5) * 2;
                    this.player.takeDamage(Math.max(drain, 3));
                    this.hud.triggerDamageFlash();
                }

                if (!enemy.isTrap) {
                    this.waveManager.onEnemyKilled();
                }
                this.enemies.splice(i, 1);
            }
        }
    }

    changeState(newState) {
        this.state = newState;

        if (newState === GAME_STATES.PLAYING) {
            this.canvas.classList.add('playing');
        } else {
            this.canvas.classList.remove('playing');
        }

        if (newState === GAME_STATES.GAME_OVER) {
            this.gameOverScreen.setStats({
                finalScore: this.player.score,
                maxCombo: this.comboSystem.maxCombo,
                wavesCleared: this.waveManager.currentWave,
                enemiesKilled: this.player.enemiesKilled,
            });
        }
    }

    startNewGame() {
        this.player.reset();
        this.player._hpRegen = 0;
        this.comboSystem.reset();
        this.waveManager.reset();
        this.upgradeSystem.reset();
        this.passiveSystem.reset();
        this.specialMode.reset();
        this.enemies = [];
        this.currentBoss = null;

        this.swatter = new Swatter();
        this.electricSwatter = new ElectricSwatter();
        this.insecticide = new Insecticide();
        this._weapons = [this.swatter, this.electricSwatter, this.insecticide];
        this._weaponIndex = 0;
        this.currentWeapon = this.swatter;

        this.hud = new HUD(this);
        this.gameTime = 0;

        this.state = GAME_STATES.PLAYING;
        this.canvas.classList.add('playing');
        this.waveManager.isActive = true;
        this.waveManager.startNextWave();
    }

    spawnEnemy(enemy) {
        this.enemies.push(enemy);
    }

    _onKeyDown(e) {
        // 暫停
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            if (this.state === GAME_STATES.PLAYING) {
                this.changeState(GAME_STATES.PAUSED);
            } else if (this.state === GAME_STATES.PAUSED) {
                this.changeState(GAME_STATES.PLAYING);
            }
        }

        // 武器切換（只在遊戲中）
        if (this.state === GAME_STATES.PLAYING) {
            const prev = this.currentWeapon;
            if (e.key === '1') { this._weaponIndex = 0; this.currentWeapon = this._weapons[0]; }
            if (e.key === '2') { this._weaponIndex = 1; this.currentWeapon = this._weapons[1]; }
            if (e.key === '3') { this._weaponIndex = 2; this.currentWeapon = this._weapons[2]; }

            // 切換離開電蚊拍時，關閉其啟動狀態避免殘留軌跡 / 持續扣電
            if (prev !== this.currentWeapon && prev.id === 'electric_swatter' && prev.isActive) {
                prev.stopUse();
            }
        }
    }
}
