// Round Game - Miami Vice: Vice Streets - Enhanced Top-Down Shooter
class ViceStreetsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.cash = 0;
        this.level = 1;
        this.enemiesKilled = 0;
        
        // Initialize systems
        this.vehicleSystem = new VehicleSystem(this);
        this.coverSystem = new CoverSystem(this);
        
        // Player
        this.player = {
            x: this.width / 2,
            y: this.height / 2,
            width: 20,
            height: 20,
            speed: 3,
            health: 100,
            maxHealth: 100,
            angle: 0,
            weapon: 'pistol',
            ammo: 30,
            maxAmmo: 30,
            reloadTime: 0,
            invulnerable: 0
        };
        
        // Weapons system
        this.weapons = {
            pistol: {
                name: 'Pistol',
                damage: 25,
                fireRate: 300,
                range: 200,
                ammo: 30,
                maxAmmo: 30,
                reloadTime: 1500,
                cost: 0,
                owned: true,
                selected: true
            },
            shotgun: {
                name: 'Shotgun',
                damage: 60,
                fireRate: 800,
                range: 120,
                ammo: 8,
                maxAmmo: 8,
                reloadTime: 2000,
                cost: 500,
                owned: false,
                selected: false
            },
            smg: {
                name: 'SMG',
                damage: 15,
                fireRate: 100,
                range: 180,
                ammo: 50,
                maxAmmo: 50,
                reloadTime: 1800,
                cost: 800,
                owned: false,
                selected: false
            },
            rifle: {
                name: 'Assault Rifle',
                damage: 35,
                fireRate: 150,
                range: 300,
                ammo: 40,
                maxAmmo: 40,
                reloadTime: 2200,
                cost: 1200,
                owned: false,
                selected: false
            }
        };
        
        // Game objects
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.pickups = [];
        this.evidence = [];
        this.walls = [];
        this.explosions = [];
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.lastShot = 0;
        
        // Level data
        this.currentLevel = 1;
        this.missionObjectives = {
            evidence: 0,
            enemies: 0,
            completed: false
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateLevel();
        this.gameLoop();
        
        // Initialize audio manager
        if (window.audioManager) {
            window.audioManager.resumeAudioContext();
        }
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    generateLevel() {
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.pickups = [];
        this.evidence = [];
        this.walls = [];
        this.explosions = [];
        
        // Generate walls for cover
        this.generateWalls();
        
        // Generate cover objects
        this.coverSystem.generateCover();
        
        // Generate enemies based on level
        const enemyCount = 5 + this.currentLevel * 2;
        for (let i = 0; i < enemyCount; i++) {
            this.spawnEnemy();
        }
        
        // Spawn enemy vehicles occasionally
        if (this.currentLevel > 2 && Math.random() < 0.3) {
            this.vehicleSystem.spawnVehicle(
                Math.random() * this.width,
                Math.random() * this.height,
                'sports'
            );
        }
        
        // Generate evidence to collect
        this.missionObjectives.evidence = 3 + this.currentLevel;
        for (let i = 0; i < this.missionObjectives.evidence; i++) {
            this.spawnEvidence();
        }
        
        // Reset player position
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.health = this.player.maxHealth;
        this.player.ammo = this.weapons[this.player.weapon].ammo;
        
        // Reset vehicle mode
        this.vehicleSystem.vehicleMode = false;
        this.vehicleSystem.playerVehicle = null;
    }
    
    generateWalls() {
        // Create cover objects
        const wallCount = 8 + this.currentLevel;
        for (let i = 0; i < wallCount; i++) {
            this.walls.push({
                x: Math.random() * (this.width - 100) + 50,
                y: Math.random() * (this.height - 100) + 50,
                width: 40 + Math.random() * 40,
                height: 40 + Math.random() * 40,
                type: 'cover'
            });
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Math.random() * this.width;
                y = -50;
                break;
            case 1: // Right
                x = this.width + 50;
                y = Math.random() * this.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.width;
                y = this.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * this.height;
                break;
        }
        
        this.enemies.push({
            x: x,
            y: y,
            width: 16,
            height: 16,
            health: 50 + this.currentLevel * 10,
            maxHealth: 50 + this.currentLevel * 10,
            speed: 1 + this.currentLevel * 0.2,
            angle: 0,
            lastShot: 0,
            fireRate: 1000 + Math.random() * 1000,
            damage: 15 + this.currentLevel * 2,
            type: 'criminal',
            ai: 'aggressive',
            targetX: this.player.x,
            targetY: this.player.y,
            state: 'patrol', // patrol, chase, attack, cover
            coverTime: 0,
            lastSeenPlayer: 0
        });
    }
    
    spawnEvidence() {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.random() * (this.width - 50) + 25;
            y = Math.random() * (this.height - 50) + 25;
            attempts++;
        } while (this.checkCollisionWithWalls(x, y, 20, 20) && attempts < 50);
        
        this.evidence.push({
            x: x,
            y: y,
            width: 15,
            height: 15,
            type: 'evidence',
            value: 100 + this.currentLevel * 50,
            collected: false
        });
    }
    
    checkCollisionWithWalls(x, y, width, height) {
        for (let wall of this.walls) {
            if (x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y) {
                return true;
            }
        }
        return false;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateBullets();
        this.updateParticles();
        this.updatePickups();
        this.updateEvidence();
        this.updateExplosions();
        this.vehicleSystem.updateVehicles();
        this.coverSystem.updateCover();
        this.checkCollisions();
        this.vehicleSystem.checkVehicleCollisions();
        this.updateUI();
        
        // Check win/lose conditions
        this.checkGameState();
    }
    
    updatePlayer() {
        // Skip player update if in vehicle mode
        if (this.vehicleSystem.vehicleMode) return;
        
        // Movement
        let dx = 0, dy = 0;
        const speed = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? this.player.speed * 1.5 : this.player.speed;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= speed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += speed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= speed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Update position with wall collision
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (!this.checkCollisionWithWalls(newX, this.player.y, this.player.width, this.player.height)) {
            this.player.x = Math.max(0, Math.min(this.width - this.player.width, newX));
        }
        if (!this.checkCollisionWithWalls(this.player.x, newY, this.player.width, this.player.height)) {
            this.player.y = Math.max(0, Math.min(this.height - this.player.height, newY));
        }
        
        // Update angle to face mouse
        this.player.angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);
        
        // Reload
        if (this.keys['KeyR'] && this.player.reloadTime <= 0) {
            this.reload();
        }
        
        // Enter vehicle
        if (this.keys['KeyE']) {
            this.tryEnterVehicle();
        }
        
        // Update timers
        if (this.player.reloadTime > 0) this.player.reloadTime -= 16;
        if (this.player.invulnerable > 0) this.player.invulnerable -= 16;
    }
    
    tryEnterVehicle() {
        for (let vehicle of this.vehicleSystem.vehicles) {
            if (this.checkCollision(this.player, vehicle)) {
                this.vehicleSystem.enterVehicle(vehicle);
                break;
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // AI behavior
            this.updateEnemyAI(enemy);
            
            // Move enemy
            const dx = Math.cos(enemy.angle) * enemy.speed;
            const dy = Math.sin(enemy.angle) * enemy.speed;
            
            const newX = enemy.x + dx;
            const newY = enemy.y + dy;
            
            if (!this.checkCollisionWithWalls(newX, enemy.y, enemy.width, enemy.height)) {
                enemy.x = Math.max(0, Math.min(this.width - enemy.width, newX));
            }
            if (!this.checkCollisionWithWalls(enemy.x, newY, enemy.width, enemy.height)) {
                enemy.y = Math.max(0, Math.min(this.height - enemy.height, newY));
            }
            
            // Enemy shooting
            if (enemy.state === 'attack' && Date.now() - enemy.lastShot > enemy.fireRate) {
                this.enemyShoot(enemy);
                enemy.lastShot = Date.now();
            }
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x, enemy.y, 'enemy');
                this.enemies.splice(i, 1);
                this.enemiesKilled++;
                this.score += 100;
                this.cash += 50;
            }
        }
    }
    
    updateEnemyAI(enemy) {
        const distToPlayer = Math.sqrt(
            Math.pow(enemy.x - this.player.x, 2) + 
            Math.pow(enemy.y - this.player.y, 2)
        );
        
        // Line of sight check
        const hasLineOfSight = this.hasLineOfSight(enemy.x, enemy.y, this.player.x, this.player.y);
        
        if (hasLineOfSight) {
            enemy.lastSeenPlayer = Date.now();
            enemy.state = 'chase';
            enemy.targetX = this.player.x;
            enemy.targetY = this.player.y;
        }
        
        if (enemy.state === 'chase') {
            if (distToPlayer < 80) {
                enemy.state = 'attack';
            } else if (distToPlayer > 200) {
                enemy.state = 'patrol';
            }
        } else if (enemy.state === 'attack') {
            if (distToPlayer > 100) {
                enemy.state = 'chase';
            }
        } else if (enemy.state === 'patrol') {
            if (Date.now() - enemy.lastSeenPlayer < 3000) {
                enemy.state = 'chase';
            }
        }
        
        // Update angle based on state
        if (enemy.state === 'chase' || enemy.state === 'attack') {
            enemy.angle = Math.atan2(enemy.targetY - enemy.y, enemy.targetX - enemy.x);
        } else {
            // Random patrol movement
            enemy.angle += (Math.random() - 0.5) * 0.1;
        }
    }
    
    hasLineOfSight(x1, y1, x2, y2) {
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            if (this.checkCollisionWithWalls(x, y, 5, 5)) {
                return false;
            }
        }
        return true;
    }
    
    enemyShoot(enemy) {
        const bullet = {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            angle: enemy.angle,
            speed: 4,
            damage: enemy.damage,
            owner: 'enemy',
            life: 120
        };
        this.bullets.push(bullet);
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            bullet.life--;
            
            // Remove bullets that are off-screen or expired
            if (bullet.life <= 0 || 
                bullet.x < 0 || bullet.x > this.width || 
                bullet.y < 0 || bullet.y > this.height) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check wall collisions
            if (this.checkCollisionWithWalls(bullet.x, bullet.y, 4, 4)) {
                this.createParticles(bullet.x, bullet.y, 'spark');
                this.bullets.splice(i, 1);
                continue;
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updatePickups() {
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            pickup.life--;
            
            if (pickup.life <= 0) {
                this.pickups.splice(i, 1);
            }
        }
    }
    
    updateEvidence() {
        // Evidence doesn't move, just check for collection
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life--;
            explosion.radius += 2;
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (bullet.owner === 'player') {
                // Check enemy collisions
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (this.checkCollision(bullet, enemy)) {
                        enemy.health -= bullet.damage;
                        this.createParticles(bullet.x, bullet.y, 'blood');
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
            } else if (bullet.owner === 'enemy') {
                // Check player collision
                if (this.checkCollision(bullet, this.player) && this.player.invulnerable <= 0) {
                    // Apply cover protection
                    const coverProtection = this.coverSystem.getCoverProtection(bullet.angle);
                    const damage = bullet.damage * (1 - coverProtection);
                    
                    this.player.health -= damage;
                    this.player.invulnerable = 1000; // 1 second invulnerability
                    this.createParticles(bullet.x, bullet.y, 'blood');
                    this.bullets.splice(i, 1);
                }
            }
        }
        
        // Evidence collection
        for (let i = this.evidence.length - 1; i >= 0; i--) {
            const evidence = this.evidence[i];
            if (!evidence.collected && this.checkCollision(this.player, evidence)) {
                evidence.collected = true;
                this.cash += evidence.value;
                this.score += 50;
                this.missionObjectives.evidence--;
                this.createParticles(evidence.x, evidence.y, 'pickup');
                this.evidence.splice(i, 1);
            }
        }
        
        // Pickup collection
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            if (this.checkCollision(this.player, pickup)) {
                this.applyPickup(pickup);
                this.pickups.splice(i, 1);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    applyPickup(pickup) {
        switch (pickup.type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
                break;
            case 'ammo':
                this.player.ammo = this.weapons[this.player.weapon].maxAmmo;
                break;
        }
        this.createParticles(pickup.x, pickup.y, 'pickup');
    }
    
    shoot() {
        const weapon = this.weapons[this.player.weapon];
        const now = Date.now();
        
        if (this.player.ammo > 0 && 
            now - this.lastShot > weapon.fireRate && 
            this.player.reloadTime <= 0) {
            
            this.player.ammo--;
            this.lastShot = now;
            
            // Create bullet
            const bullet = {
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                angle: this.player.angle,
                speed: 8,
                damage: weapon.damage,
                owner: 'player',
                life: 120
            };
            this.bullets.push(bullet);
            
            // Create muzzle flash
            this.createParticles(bullet.x, bullet.y, 'muzzle');
            
            // Play shoot sound
            if (window.audioManager) {
                window.audioManager.playSound('shoot');
            }
        }
    }
    
    reload() {
        const weapon = this.weapons[this.player.weapon];
        this.player.reloadTime = weapon.reloadTime;
        this.player.ammo = weapon.maxAmmo;
        
        // Play reload sound
        if (window.audioManager) {
            window.audioManager.playSound('reload');
        }
    }
    
    createParticles(x, y, type) {
        const count = type === 'muzzle' ? 8 : 5;
        const colors = {
            spark: ['#ffff00', '#ff8800'],
            blood: ['#ff0000', '#880000'],
            pickup: ['#00ff00', '#00aa00'],
            muzzle: ['#ffff00', '#ffaa00']
        };
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                alpha: 1
            });
        }
    }
    
    createExplosion(x, y, type) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 0,
            life: 30,
            maxLife: 30,
            type: type
        });
        
        // Create explosion particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 60,
                maxLife: 60,
                color: ['#ff4400', '#ff8800', '#ffff00'][Math.floor(Math.random() * 3)],
                alpha: 1
            });
        }
    }
    
    updateUI() {
        // Update health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        
        // Update ammo display
        const weapon = this.weapons[this.player.weapon];
        document.getElementById('ammoDisplay').textContent = `${this.player.ammo}/${weapon.maxAmmo}`;
        
        // Update cash and score
        document.getElementById('cashAmount').textContent = this.cash;
        document.getElementById('scoreAmount').textContent = this.score;
        
        // Update mission info
        document.getElementById('missionTitle').textContent = `MISSION: LEVEL ${this.currentLevel}`;
        document.getElementById('missionObjective').textContent = 
            `Evidence: ${this.missionObjectives.evidence} | Enemies: ${this.enemies.length}`;
        
        // Update vehicle status
        const vehicleStatus = document.getElementById('vehicleStatus');
        const coverStatus = document.getElementById('coverStatus');
        
        if (this.vehicleSystem.vehicleMode && this.vehicleSystem.playerVehicle) {
            vehicleStatus.style.display = 'block';
            coverStatus.style.display = 'none';
            
            const vehicle = this.vehicleSystem.playerVehicle;
            document.getElementById('vehicleType').textContent = vehicle.type.toUpperCase();
            
            const vehicleHealthPercent = (vehicle.health / vehicle.maxHealth) * 100;
            document.getElementById('vehicleHealthFill').style.width = vehicleHealthPercent + '%';
        } else {
            vehicleStatus.style.display = 'none';
            
            // Update cover status
            if (this.coverSystem.playerInCover) {
                coverStatus.style.display = 'block';
            } else {
                coverStatus.style.display = 'none';
            }
        }
    }
    
    checkGameState() {
        // Check if player is dead
        if (this.player.health <= 0) {
            this.gameOver(false);
            return;
        }
        
        // Check if mission is complete
        if (this.missionObjectives.evidence <= 0 && this.enemies.length === 0) {
            this.missionComplete();
        }
    }
    
    missionComplete() {
        this.score += 500;
        this.cash += 200;
        this.currentLevel++;
        
        // Play mission complete sound
        if (window.audioManager) {
            window.audioManager.playSound('missionComplete');
        }
        
        // Show mission complete screen briefly, then next level
        setTimeout(() => {
            this.generateLevel();
        }, 2000);
    }
    
    gameOver(won) {
        this.gameState = 'gameOver';
        document.getElementById('gameOverTitle').textContent = won ? 'MISSION COMPLETE!' : 'MISSION FAILED';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCash').textContent = this.cash;
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        
        // Play game over sound
        if (window.audioManager) {
            window.audioManager.playSound('gameOver');
        }
        
        this.showScreen('gameOverScreen');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid pattern
        this.drawGrid();
        
        // Draw walls
        this.drawWalls();
        
        // Draw cover objects
        this.coverSystem.renderCover();
        
        // Draw evidence
        this.drawEvidence();
        
        // Draw pickups
        this.drawPickups();
        
        // Draw vehicles
        this.vehicleSystem.renderVehicles();
        
        // Draw enemies
        this.drawEnemies();
        
        // Draw player (only if not in vehicle)
        if (!this.vehicleSystem.vehicleMode) {
            this.drawPlayer();
        }
        
        // Draw bullets
        this.drawBullets();
        
        // Draw particles
        this.drawParticles();
        
        // Draw explosions
        this.drawExplosions();
        
        // Draw crosshair
        this.drawCrosshair();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    drawWalls() {
        this.ctx.fillStyle = '#333333';
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        
        for (let wall of this.walls) {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        }
    }
    
    drawEvidence() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.strokeStyle = '#00aa00';
        this.ctx.lineWidth = 2;
        
        for (let evidence of this.evidence) {
            if (!evidence.collected) {
                this.ctx.fillRect(evidence.x, evidence.y, evidence.width, evidence.height);
                this.ctx.strokeRect(evidence.x, evidence.y, evidence.width, evidence.height);
                
                // Draw evidence icon
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('E', evidence.x + evidence.width/2, evidence.y + evidence.height/2 + 4);
                this.ctx.fillStyle = '#00ff00';
            }
        }
    }
    
    drawPickups() {
        for (let pickup of this.pickups) {
            this.ctx.fillStyle = pickup.type === 'health' ? '#ff0000' : '#ffff00';
            this.ctx.strokeStyle = pickup.type === 'health' ? '#aa0000' : '#aaaa00';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(pickup.x, pickup.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    drawEnemies() {
        for (let enemy of this.enemies) {
            // Enemy body
            this.ctx.fillStyle = '#ff4444';
            this.ctx.strokeStyle = '#aa0000';
            this.ctx.lineWidth = 2;
            
            this.ctx.save();
            this.ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.ctx.rotate(enemy.angle);
            this.ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
            this.ctx.strokeRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
            this.ctx.restore();
            
            // Health bar
            if (enemy.health < enemy.maxHealth) {
                const barWidth = 30;
                const barHeight = 4;
                const healthPercent = enemy.health / enemy.maxHealth;
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(enemy.x - 5, enemy.y - 10, barWidth, barHeight);
                
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x - 5, enemy.y - 10, barWidth * healthPercent, barHeight);
            }
        }
    }
    
    drawPlayer() {
        // Player body
        this.ctx.fillStyle = this.player.invulnerable > 0 ? '#ffffff' : '#00aaff';
        this.ctx.strokeStyle = '#0088cc';
        this.ctx.lineWidth = 2;
        
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        this.ctx.rotate(this.player.angle);
        this.ctx.fillRect(-this.player.width/2, -this.player.height/2, this.player.width, this.player.height);
        this.ctx.strokeRect(-this.player.width/2, -this.player.height/2, this.player.width, this.player.height);
        
        // Weapon direction indicator
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillRect(this.player.width/2 - 2, -2, 8, 4);
        this.ctx.restore();
    }
    
    drawBullets() {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 1;
        
        for (let bullet of this.bullets) {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawExplosions() {
        for (let explosion of this.explosions) {
            const alpha = explosion.life / explosion.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ff4400';
            this.ctx.strokeStyle = '#ff8800';
            this.ctx.lineWidth = 3;
            
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    drawCrosshair() {
        const size = 20;
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouse.x - size/2, this.mouse.y);
        this.ctx.lineTo(this.mouse.x + size/2, this.mouse.y);
        this.ctx.moveTo(this.mouse.x, this.mouse.y - size/2);
        this.ctx.lineTo(this.mouse.x, this.mouse.y + size/2);
        this.ctx.stroke();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').classList.add('active');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseMenu').classList.remove('active');
        }
    }
}

// Global functions for UI
let game;

function startGame() {
    game = new ViceStreetsGame();
    game.gameState = 'playing';
    game.showScreen('gameScreen');
}

function showShop() {
    game.showScreen('shopScreen');
    populateWeaponShop();
}

function showSettings() {
    game.showScreen('settingsScreen');
}

function showMainMenu() {
    if (game) {
        game.gameState = 'menu';
    }
    game.showScreen('mainMenu');
}

function resumeGame() {
    if (game) {
        game.gameState = 'playing';
        document.getElementById('pauseMenu').classList.remove('active');
    }
}

function restartMission() {
    if (game) {
        game.generateLevel();
        game.gameState = 'playing';
        game.showScreen('gameScreen');
    }
}

function populateWeaponShop() {
    const weaponGrid = document.getElementById('weaponGrid');
    weaponGrid.innerHTML = '';
    
    for (let weaponId in game.weapons) {
        const weapon = game.weapons[weaponId];
        const card = document.createElement('div');
        card.className = `weapon-card ${weapon.owned ? 'owned' : ''} ${weapon.selected ? 'selected' : ''}`;
        
        card.innerHTML = `
            <div class="weapon-name">${weapon.name}</div>
            <div class="weapon-stats">
                Damage: ${weapon.damage}<br>
                Fire Rate: ${weapon.fireRate}ms<br>
                Range: ${weapon.range}<br>
                Ammo: ${weapon.maxAmmo}
            </div>
            <div class="weapon-price">$${weapon.cost}</div>
        `;
        
        card.onclick = () => {
            if (weapon.owned) {
                selectWeapon(weaponId);
            } else if (game.cash >= weapon.cost) {
                buyWeapon(weaponId);
            }
        };
        
        weaponGrid.appendChild(card);
    }
}

function buyWeapon(weaponId) {
    const weapon = game.weapons[weaponId];
    if (game.cash >= weapon.cost) {
        game.cash -= weapon.cost;
        weapon.owned = true;
        populateWeaponShop();
    }
}

function selectWeapon(weaponId) {
    // Deselect all weapons
    for (let id in game.weapons) {
        game.weapons[id].selected = false;
    }
    
    // Select new weapon
    game.weapons[weaponId].selected = true;
    game.player.weapon = weaponId;
    game.player.ammo = game.weapons[weaponId].ammo;
    game.player.maxAmmo = game.weapons[weaponId].maxAmmo;
    
    populateWeaponShop();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set initial screen
    document.getElementById('mainMenu').classList.add('active');
});