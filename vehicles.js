// Miami Vice Vehicle System
class VehicleSystem {
    constructor(game) {
        this.game = game;
        this.vehicles = [];
        this.playerVehicle = null;
        this.vehicleMode = false;
        this.vehicleTypes = {
            police: {
                name: 'Police Cruiser',
                speed: 4,
                turnSpeed: 0.05,
                health: 150,
                width: 40,
                height: 20,
                color: '#00aaff',
                weapon: 'siren'
            },
            sports: {
                name: 'Sports Car',
                speed: 6,
                turnSpeed: 0.08,
                health: 100,
                width: 35,
                height: 18,
                color: '#ff0080',
                weapon: 'none'
            },
            truck: {
                name: 'Armored Truck',
                speed: 2.5,
                turnSpeed: 0.03,
                health: 300,
                width: 50,
                height: 25,
                color: '#666666',
                weapon: 'turret'
            }
        };
    }
    
    spawnVehicle(x, y, type, isPlayer = false) {
        const vehicleData = this.vehicleTypes[type];
        const vehicle = {
            x: x,
            y: y,
            width: vehicleData.width,
            height: vehicleData.height,
            angle: 0,
            speed: vehicleData.speed,
            turnSpeed: vehicleData.turnSpeed,
            health: vehicleData.health,
            maxHealth: vehicleData.health,
            type: type,
            color: vehicleData.color,
            weapon: vehicleData.weapon,
            isPlayer: isPlayer,
            velocity: { x: 0, y: 0 },
            lastShot: 0,
            fireRate: 500,
            damage: 30
        };
        
        if (isPlayer) {
            this.playerVehicle = vehicle;
            this.vehicleMode = true;
        } else {
            this.vehicles.push(vehicle);
        }
        
        return vehicle;
    }
    
    updateVehicles() {
        // Update player vehicle
        if (this.playerVehicle && this.vehicleMode) {
            this.updatePlayerVehicle();
        }
        
        // Update enemy vehicles
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];
            this.updateEnemyVehicle(vehicle);
            
            // Remove destroyed vehicles
            if (vehicle.health <= 0) {
                this.game.createExplosion(vehicle.x, vehicle.y, 'vehicle');
                this.vehicles.splice(i, 1);
            }
        }
    }
    
    updatePlayerVehicle() {
        const vehicle = this.playerVehicle;
        let acceleration = 0;
        let turnDirection = 0;
        
        // Input handling
        if (this.game.keys['KeyW'] || this.game.keys['ArrowUp']) {
            acceleration = 0.3;
        }
        if (this.game.keys['KeyS'] || this.game.keys['ArrowDown']) {
            acceleration = -0.2;
        }
        if (this.game.keys['KeyA'] || this.game.keys['ArrowLeft']) {
            turnDirection = -1;
        }
        if (this.game.keys['KeyD'] || this.game.keys['ArrowRight']) {
            turnDirection = 1;
        }
        
        // Update angle
        vehicle.angle += turnDirection * vehicle.turnSpeed;
        
        // Update velocity
        const currentSpeed = Math.sqrt(vehicle.velocity.x ** 2 + vehicle.velocity.y ** 2);
        const maxSpeed = vehicle.speed;
        
        if (acceleration !== 0) {
            vehicle.velocity.x += Math.cos(vehicle.angle) * acceleration;
            vehicle.velocity.y += Math.sin(vehicle.angle) * acceleration;
        } else {
            // Apply friction
            vehicle.velocity.x *= 0.9;
            vehicle.velocity.y *= 0.9;
        }
        
        // Limit speed
        if (currentSpeed > maxSpeed) {
            const ratio = maxSpeed / currentSpeed;
            vehicle.velocity.x *= ratio;
            vehicle.velocity.y *= ratio;
        }
        
        // Update position
        const newX = vehicle.x + vehicle.velocity.x;
        const newY = vehicle.y + vehicle.velocity.y;
        
        // Check wall collisions
        if (!this.game.checkCollisionWithWalls(newX, vehicle.y, vehicle.width, vehicle.height)) {
            vehicle.x = Math.max(0, Math.min(this.game.width - vehicle.width, newX));
        }
        if (!this.game.checkCollisionWithWalls(vehicle.x, newY, vehicle.width, vehicle.height)) {
            vehicle.y = Math.max(0, Math.min(this.game.height - vehicle.height, newY));
        }
        
        // Vehicle shooting
        if (this.game.mouse.down && Date.now() - vehicle.lastShot > vehicle.fireRate) {
            this.vehicleShoot(vehicle);
            vehicle.lastShot = Date.now();
        }
        
        // Exit vehicle
        if (this.game.keys['KeyE']) {
            this.exitVehicle();
        }
    }
    
    updateEnemyVehicle(vehicle) {
        // Simple AI - move towards player
        const dx = this.game.player.x - vehicle.x;
        const dy = this.game.player.y - vehicle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const targetAngle = Math.atan2(dy, dx);
            const angleDiff = targetAngle - vehicle.angle;
            
            // Normalize angle difference
            let normalizedDiff = angleDiff;
            while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
            while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
            
            // Turn towards player
            if (Math.abs(normalizedDiff) > 0.1) {
                vehicle.angle += Math.sign(normalizedDiff) * vehicle.turnSpeed;
            }
            
            // Move forward
            vehicle.velocity.x = Math.cos(vehicle.angle) * vehicle.speed * 0.5;
            vehicle.velocity.y = Math.sin(vehicle.angle) * vehicle.speed * 0.5;
            
            // Update position
            vehicle.x += vehicle.velocity.x;
            vehicle.y += vehicle.velocity.y;
            
            // Keep in bounds
            vehicle.x = Math.max(0, Math.min(this.game.width - vehicle.width, vehicle.x));
            vehicle.y = Math.max(0, Math.min(this.game.height - vehicle.height, vehicle.y));
        }
        
        // Enemy vehicle shooting
        if (distance < 200 && Date.now() - vehicle.lastShot > vehicle.fireRate) {
            this.vehicleShoot(vehicle);
            vehicle.lastShot = Date.now();
        }
    }
    
    vehicleShoot(vehicle) {
        const bullet = {
            x: vehicle.x + vehicle.width / 2,
            y: vehicle.y + vehicle.height / 2,
            angle: vehicle.angle,
            speed: 6,
            damage: vehicle.damage,
            owner: vehicle.isPlayer ? 'player' : 'enemy',
            life: 120,
            type: 'vehicle'
        };
        this.game.bullets.push(bullet);
        
        // Play vehicle shoot sound
        if (window.audioManager) {
            window.audioManager.playSound('shoot');
        }
    }
    
    exitVehicle() {
        if (this.playerVehicle) {
            // Place player near vehicle
            this.game.player.x = this.playerVehicle.x + this.playerVehicle.width / 2 - this.game.player.width / 2;
            this.game.player.y = this.playerVehicle.y + this.playerVehicle.height / 2 - this.game.player.height / 2;
            
            this.playerVehicle = null;
            this.vehicleMode = false;
        }
    }
    
    enterVehicle(vehicle) {
        if (vehicle && !this.vehicleMode) {
            this.playerVehicle = vehicle;
            this.vehicleMode = true;
            
            // Remove from vehicles array if it was an enemy vehicle
            const index = this.vehicles.indexOf(vehicle);
            if (index > -1) {
                this.vehicles.splice(index, 1);
            }
        }
    }
    
    renderVehicles() {
        // Render enemy vehicles
        for (let vehicle of this.vehicles) {
            this.renderVehicle(vehicle);
        }
        
        // Render player vehicle
        if (this.playerVehicle && this.vehicleMode) {
            this.renderVehicle(this.playerVehicle, true);
        }
    }
    
    renderVehicle(vehicle, isPlayer = false) {
        const ctx = this.game.ctx;
        
        ctx.save();
        ctx.translate(vehicle.x + vehicle.width / 2, vehicle.y + vehicle.height / 2);
        ctx.rotate(vehicle.angle);
        
        // Vehicle body
        ctx.fillStyle = vehicle.color;
        ctx.strokeStyle = isPlayer ? '#ffffff' : '#333333';
        ctx.lineWidth = 2;
        
        ctx.fillRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        ctx.strokeRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        
        // Vehicle details
        ctx.fillStyle = '#000000';
        ctx.fillRect(-vehicle.width / 2 + 5, -vehicle.height / 2 + 5, vehicle.width - 10, 5);
        ctx.fillRect(-vehicle.width / 2 + 5, vehicle.height / 2 - 10, vehicle.width - 10, 5);
        
        // Headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-vehicle.width / 2 + 2, -vehicle.height / 2 + 2, 4, 3);
        ctx.fillRect(vehicle.width / 2 - 6, -vehicle.height / 2 + 2, 4, 3);
        
        // Health bar for damaged vehicles
        if (vehicle.health < vehicle.maxHealth) {
            ctx.restore();
            const barWidth = 30;
            const barHeight = 4;
            const healthPercent = vehicle.health / vehicle.maxHealth;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(vehicle.x - 5, vehicle.y - 15, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(vehicle.x - 5, vehicle.y - 15, barWidth * healthPercent, barHeight);
        } else {
            ctx.restore();
        }
    }
    
    checkVehicleCollisions() {
        // Check player vehicle collisions with enemies
        if (this.playerVehicle && this.vehicleMode) {
            for (let i = this.game.enemies.length - 1; i >= 0; i--) {
                const enemy = this.game.enemies[i];
                if (this.game.checkCollision(this.playerVehicle, enemy)) {
                    // Damage enemy
                    enemy.health -= 50;
                    this.game.createExplosion(enemy.x, enemy.y, 'enemy');
                    
                    // Damage vehicle
                    this.playerVehicle.health -= 10;
                    
                    // Remove enemy
                    this.game.enemies.splice(i, 1);
                    this.game.enemiesKilled++;
                    this.game.score += 100;
                }
            }
        }
        
        // Check vehicle-to-vehicle collisions
        for (let i = 0; i < this.vehicles.length; i++) {
            for (let j = i + 1; j < this.vehicles.length; j++) {
                const vehicle1 = this.vehicles[i];
                const vehicle2 = this.vehicles[j];
                
                if (this.game.checkCollision(vehicle1, vehicle2)) {
                    // Damage both vehicles
                    vehicle1.health -= 20;
                    vehicle2.health -= 20;
                    
                    // Create collision effect
                    this.game.createExplosion(
                        (vehicle1.x + vehicle2.x) / 2,
                        (vehicle1.y + vehicle2.y) / 2,
                        'collision'
                    );
                }
            }
        }
    }
}

// Cover System Enhancement
class CoverSystem {
    constructor(game) {
        this.game = game;
        this.coverObjects = [];
        this.playerInCover = false;
        this.coverAngle = 0;
    }
    
    generateCover() {
        this.coverObjects = [];
        
        // Create various cover types
        const coverTypes = [
            { type: 'barrier', width: 60, height: 20 },
            { type: 'concrete', width: 40, height: 40 },
            { type: 'car', width: 50, height: 25 },
            { type: 'dumpster', width: 30, height: 35 }
        ];
        
        const coverCount = 6 + this.game.currentLevel;
        for (let i = 0; i < coverCount; i++) {
            const coverType = coverTypes[Math.floor(Math.random() * coverTypes.length)];
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.random() * (this.game.width - coverType.width);
                y = Math.random() * (this.game.height - coverType.height);
                attempts++;
            } while (this.game.checkCollisionWithWalls(x, y, coverType.width, coverType.height) && attempts < 50);
            
            this.coverObjects.push({
                x: x,
                y: y,
                width: coverType.width,
                height: coverType.height,
                type: coverType.type,
                health: 100,
                maxHealth: 100,
                destructible: coverType.type !== 'concrete'
            });
        }
    }
    
    updateCover() {
        for (let i = this.coverObjects.length - 1; i >= 0; i--) {
            const cover = this.coverObjects[i];
            
            // Check if cover is destroyed
            if (cover.health <= 0 && cover.destructible) {
                this.game.createExplosion(cover.x + cover.width/2, cover.y + cover.height/2, 'cover');
                this.coverObjects.splice(i, 1);
            }
        }
        
        // Check if player is in cover
        this.checkPlayerCover();
    }
    
    checkPlayerCover() {
        this.playerInCover = false;
        
        for (let cover of this.coverObjects) {
            if (this.game.checkCollision(this.game.player, cover)) {
                this.playerInCover = true;
                
                // Calculate cover angle
                const dx = this.game.player.x - (cover.x + cover.width / 2);
                const dy = this.game.player.y - (cover.y + cover.height / 2);
                this.coverAngle = Math.atan2(dy, dx);
                break;
            }
        }
    }
    
    renderCover() {
        const ctx = this.game.ctx;
        
        for (let cover of this.coverObjects) {
            ctx.save();
            
            // Cover body
            switch (cover.type) {
                case 'barrier':
                    ctx.fillStyle = '#ffaa00';
                    ctx.strokeStyle = '#cc8800';
                    break;
                case 'concrete':
                    ctx.fillStyle = '#888888';
                    ctx.strokeStyle = '#666666';
                    break;
                case 'car':
                    ctx.fillStyle = '#444444';
                    ctx.strokeStyle = '#222222';
                    break;
                case 'dumpster':
                    ctx.fillStyle = '#2d5016';
                    ctx.strokeStyle = '#1a3009';
                    break;
            }
            
            ctx.lineWidth = 2;
            ctx.fillRect(cover.x, cover.y, cover.width, cover.height);
            ctx.strokeRect(cover.x, cover.y, cover.width, cover.height);
            
            // Cover details
            if (cover.type === 'car') {
                // Car windows
                ctx.fillStyle = '#000000';
                ctx.fillRect(cover.x + 5, cover.y + 5, cover.width - 10, 8);
                ctx.fillRect(cover.x + 5, cover.y + cover.height - 13, cover.width - 10, 8);
            } else if (cover.type === 'dumpster') {
                // Dumpster lid
                ctx.fillStyle = '#1a3009';
                ctx.fillRect(cover.x + 2, cover.y + 2, cover.width - 4, 8);
            }
            
            // Health bar for damaged cover
            if (cover.health < cover.maxHealth && cover.destructible) {
                const barWidth = cover.width;
                const barHeight = 4;
                const healthPercent = cover.health / cover.maxHealth;
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(cover.x, cover.y - 8, barWidth, barHeight);
                
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(cover.x, cover.y - 8, barWidth * healthPercent, barHeight);
            }
            
            ctx.restore();
        }
    }
    
    getCoverProtection(angle) {
        if (!this.playerInCover) return 0;
        
        // Calculate protection based on angle relative to cover
        const angleDiff = Math.abs(angle - this.coverAngle);
        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        
        // Full protection from behind cover, partial from sides
        if (normalizedDiff < Math.PI / 4) {
            return 0.8; // 80% damage reduction
        } else if (normalizedDiff < Math.PI / 2) {
            return 0.4; // 40% damage reduction
        }
        
        return 0;
    }
}
