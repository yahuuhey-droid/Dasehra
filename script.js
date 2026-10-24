/**
 * Dussehra Interactive Animation & Wishing Script
 * Ravan Vadh Animation, Fireworks, Brahmastra Flight, and Sharing System
 */

(function () {
    'use strict';

    // DOM Elements
    const canvas = document.getElementById('fxCanvas');
    const ctx = canvas.getContext('2d');

    const shootBtn = document.getElementById('shootBtn');
    const battleStatus = document.getElementById('statusMessage');
    const soundToggle = document.getElementById('soundToggle');

    const ramaBox = document.getElementById('ramaBox');
    const ramaCombatPose = document.getElementById('ramaCombatPose');
    const ramaPeacefulPose = document.getElementById('ramaPeacefulPose');
    const ramNameTag = document.getElementById('ramNameTag');
    const loadedArrow = document.getElementById('loadedArrow');
    const bowString = document.getElementById('bowString');
    const drawingArm = document.getElementById('drawingArm');

    const vsBadge = document.getElementById('vsBadge');
    const skyVictoryBanner = document.getElementById('skyVictoryBanner');

    const ravanBox = document.getElementById('ravanBox');
    const ravanSvg = document.getElementById('ravanSvg');
    const ravanSpeech = document.getElementById('ravanSpeech');
    const ravanSpeechText = document.getElementById('ravanSpeechText');
    const ravanBurnOverlay = document.getElementById('ravanBurnOverlay');
    const ravanNavelTarget = document.getElementById('ravanNavelTarget');
    const ravanHeads = document.querySelectorAll('.sub-head, .main-head');

    // Share & Name Inputs
    const nameInput = document.getElementById('nameInput');
    const generateBtn = document.getElementById('generateBtn');
    const senderNameDisplay = document.getElementById('senderNameDisplay');
    const whatsappShareBtn = document.getElementById('whatsappShareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const replayBtn = document.getElementById('replayBtn');
    const toastAlert = document.getElementById('toastAlert');

    // Modal
    const victoryModal = document.getElementById('victoryModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalCloseActionBtn = document.getElementById('modalCloseActionBtn');
    const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
    const modalWishingFrom = document.getElementById('modalWishingFrom');

    // Animation States
    let isShooting = false;
    let hasRavanDied = false;
    let activeArrow = null; // flying arrow object
    const particles = [];
    const fireworks = [];
    const confettiPetals = [];
    const shootingStars = [];

    let currentSenderName = "";

    // ----------------------------------------------------
    // Twinkling Night Sky Stars Generator (Adaptive & Hardware Accelerated)
    // ----------------------------------------------------
    function generateNightSkyStars() {
        const starsLayer = document.querySelector('.stars-layer');
        if (!starsLayer) return;
        starsLayer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        // Adaptive star count for buttery-smooth mobile 60 FPS
        const isMobile = window.innerWidth < 768;
        const starCount = isMobile ? 45 : 80;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'css-star';
            const size = Math.random() < 0.75 ? (Math.random() * 2 + 1) : 3;
            const posX = Math.random() * 100;
            const posY = Math.random() * 85; // Upper 85% of sky
            const dur = (Math.random() * 2.5 + 2).toFixed(2);
            const del = (Math.random() * 3).toFixed(2);
            const minOp = (Math.random() * 0.25 + 0.15).toFixed(2);

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${posX}%`;
            star.style.top = `${posY}%`;
            star.style.setProperty('--twinkle-dur', `${dur}s`);
            star.style.setProperty('--twinkle-del', `${del}s`);
            star.style.setProperty('--star-min-op', minOp);

            const colors = ['#FFFFFF', '#FFFFFF', '#FFFDF0', '#FFEAA7'];
            star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            fragment.appendChild(star);
        }
        starsLayer.appendChild(fragment);
    }

    // ----------------------------------------------------
    // Shooting Star (Meteor in the Night Sky)
    // ----------------------------------------------------
    class ShootingStar {
        constructor() {
            this.x = Math.random() * canvas.width * 0.75;
            this.y = Math.random() * (canvas.height * 0.35);
            this.len = Math.random() * 70 + 40;
            this.speed = Math.random() * 10 + 12;
            this.size = Math.random() * 1.5 + 1;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
            this.opacity = 1;
            this.active = true;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= 0.03;
            if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
                this.active = false;
            }
        }

        draw(ctx) {
            if (!this.active) return;
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.lineWidth = this.size;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FFEAA7';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ----------------------------------------------------
    // Resize Canvas & Cached Layout Metrics (Prevents Layout Thrashing)
    // ----------------------------------------------------
    let cachedArenaRect = null;
    function updateCachedLayout() {
        const arena = document.getElementById('battleArena');
        if (arena) {
            cachedArenaRect = arena.getBoundingClientRect();
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateCachedLayout();
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateCachedLayout, { passive: true });
    resizeCanvas();

    // ----------------------------------------------------
    // Parse URL Parameters (?name=Rahul)
    // ----------------------------------------------------
    function parseUrlName() {
        updateSenderName();
    }

    function updateSenderName() {
        if (senderNameDisplay) senderNameDisplay.textContent = "";
        if (modalWishingFrom) modalWishingFrom.textContent = "आपको और आपके समस्त परिवार को";

        // Festive document title without personal names
        document.title = "दीपावली एवं विजयदशमी की हार्दिक शुभकामनाएं! 🪔🏹";
    }

    // ----------------------------------------------------
    // Sound Controller
    // ----------------------------------------------------
    soundToggle.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        if (isMuted) {
            soundToggle.classList.add('muted');
            soundToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i><span>ध्वनि बंद</span>';
        } else {
            soundToggle.classList.remove('muted');
            soundToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i><span>ध्वनि चालू</span>';
            window.soundEngine.playTempleBell(520);
        }
    });

    // ----------------------------------------------------
    // Particle Class
    // ----------------------------------------------------
    class Particle {
        constructor(x, y, color, vx, vy, size, life, decay, type = 'fire') {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.life = life;
            this.maxLife = life;
            this.decay = decay;
            this.type = type;
            this.gravity = type === 'petal' ? 0.08 : (type === 'firework' ? 0.05 : -0.02);
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.life -= this.decay;
            this.rotation += this.rotSpeed;

            if (this.type === 'fire') {
                this.size *= 0.96;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life / this.maxLife);

            if (this.type === 'petal') {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = this.color;
                // High-performance additive glowing without CPU blur bottlenecks
                if (this.type === 'fire') {
                    ctx.globalCompositeOperation = 'lighter';
                }
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // ----------------------------------------------------
    // Firework Shell
    // ----------------------------------------------------
    class FireworkShell {
        constructor(startX, startY, targetX, targetY, colorPalette) {
            this.x = startX;
            this.y = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.colorPalette = colorPalette;
            this.speed = 10;
            const angle = Math.atan2(targetY - startY, targetX - startX);
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
            this.exploded = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Check if reached target
            if (this.vy < 0 && this.y <= this.targetY) {
                this.explode();
            }
        }

        explode() {
            this.exploded = true;
            window.soundEngine.playFirecrackerPop();

            const count = window.innerWidth < 768 ? 26 : 48;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                const speed = 2 + Math.random() * 5.5;
                const color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
                particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        color,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() * 2.5 + 1.2,
                        1,
                        0.018 + Math.random() * 0.01,
                        'firework'
                    )
                );
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = '#FFEAA7';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FF9F43';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ----------------------------------------------------
    // Flying Arrow (Brahmastra) - High Precision Time-Synced Flight
    // ----------------------------------------------------
    class BrahmastraArrow {
        constructor(startX, startY, targetX, targetY, duration = 850) {
            this.x = startX;
            this.y = startY;
            this.startX = startX;
            this.startY = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.prevX = startX - 5;
            this.prevY = startY;

            this.startTime = performance.now();
            this.duration = duration; // Millisecond exact duration for zero audio desync
            this.progress = 0;
            this.completed = false;
        }

        update(now) {
            const currentTime = now || performance.now();
            const elapsed = currentTime - this.startTime;
            this.progress = Math.min(1, elapsed / this.duration);

            if (this.progress >= 1) {
                this.progress = 1;
                this.completed = true;
            }

            // Curved trajectory (gentle arch)
            const currentX = this.startX + (this.targetX - this.startX) * this.progress;
            const arch = Math.sin(this.progress * Math.PI) * -50;
            const currentY = this.startY + (this.targetY - this.startY) * this.progress + arch;

            this.prevX = this.x;
            this.prevY = this.y;
            this.x = currentX;
            this.y = currentY;

            // Emit fiery trail particles behind the arrow (lightweight & crisp)
            if (!this.completed) {
                for (let i = 0; i < 2; i++) {
                    const colors = ['#FFF275', '#FFA502', '#FF4757', '#FFFFFF'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const vx = (Math.random() - 0.5) * 1.5 - 2;
                    const vy = (Math.random() - 0.5) * 1.5;
                    particles.push(
                        new Particle(this.x, this.y, color, vx, vy, Math.random() * 3 + 1.5, 1, 0.05, 'fire')
                    );
                }
            }
        }

        draw(ctx) {
            const angle = Math.atan2(this.y - this.prevY, this.x - this.prevX);

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);

            // Arrow Length & Shaft
            const length = 68;
            ctx.strokeStyle = '#FFEAA7';
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#FFD700';

            ctx.beginPath();
            ctx.moveTo(-length, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Inner golden glow
            ctx.strokeStyle = '#FFA502';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-length, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Arrow Head (Divine Trident Crescent Spear)
            ctx.fillStyle = '#FFF275';
            ctx.beginPath();
            ctx.moveTo(16, 0);
            ctx.lineTo(-8, -9);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-8, 9);
            ctx.closePath();
            ctx.fill();

            // Glowing halo around arrow tip
            const tipGlow = ctx.createRadialGradient(6, 0, 0, 6, 0, 20);
            tipGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            tipGlow.addColorStop(0.35, 'rgba(255, 215, 0, 0.7)');
            tipGlow.addColorStop(0.75, 'rgba(255, 71, 87, 0.35)');
            tipGlow.addColorStop(1, 'rgba(255, 71, 87, 0)');

            ctx.fillStyle = tipGlow;
            ctx.beginPath();
            ctx.arc(6, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // ----------------------------------------------------
    // Main Animation Loop (High Performance 60 FPS)
    // ----------------------------------------------------
    function animate(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cap active particles to prevent mobile frame drops
        const maxParticles = window.innerWidth < 768 ? 60 : 120;
        if (particles.length > maxParticles) {
            particles.splice(0, particles.length - maxParticles);
        }

        // Update & Render active arrow (time-synchronized)
        if (activeArrow && !activeArrow.completed) {
            activeArrow.update(now);
            activeArrow.draw(ctx);

            if (activeArrow.completed) {
                onArrowImpact();
                activeArrow = null;
            }
        }

        // Update & Render Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            if (!fireworks[i].exploded) {
                fireworks[i].draw(ctx);
            } else {
                fireworks.splice(i, 1);
            }
        }

        // Update & Render Shooting Stars
        if (Math.random() < 0.007) {
            shootingStars.push(new ShootingStar());
        }
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            shootingStars[i].update();
            shootingStars[i].draw(ctx);
            if (!shootingStars[i].active) {
                shootingStars.splice(i, 1);
            }
        }

        // Update & Render Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Ambient Torches embers rising continuously
        if (Math.random() < 0.2) {
            spawnTorchEmbers();
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function spawnTorchEmbers() {
        if (!cachedArenaRect) updateCachedLayout();
        const arenaRect = cachedArenaRect;
        if (!arenaRect || arenaRect.bottom < 0 || arenaRect.top > window.innerHeight) return;

        // Left torch
        particles.push(
            new Particle(
                arenaRect.left + 35,
                arenaRect.bottom - 80,
                '#FF9F43',
                (Math.random() - 0.5) * 1,
                -Math.random() * 2 - 1,
                Math.random() * 3 + 1,
                1,
                0.015,
                'fire'
            )
        );

        // Right torch
        particles.push(
            new Particle(
                arenaRect.right - 35,
                arenaRect.bottom - 80,
                '#FF6B1A',
                (Math.random() - 0.5) * 1,
                -Math.random() * 2 - 1,
                Math.random() * 3 + 1,
                1,
                0.015,
                'fire'
            )
        );
    }

    // ----------------------------------------------------
    // Change Rama Pose (Combat Archer vs Peaceful Blessing)
    // ----------------------------------------------------
    function setRamaPose(isPeaceful) {
        if (isPeaceful) {
            // Smoothly switch from combat aim to peaceful stance
            if (ramaCombatPose) {
                ramaCombatPose.style.opacity = '0';
                setTimeout(() => {
                    ramaCombatPose.style.display = 'none';
                }, 300);
            }
            if (ramaPeacefulPose) {
                setTimeout(() => {
                    ramaPeacefulPose.style.display = 'block';
                    setTimeout(() => {
                        ramaPeacefulPose.style.opacity = '1';
                    }, 50);
                }, 200);
            }
            ramaBox.classList.remove('rama-drawing');
            ramaBox.classList.add('rama-peaceful');
            if (ramNameTag) ramNameTag.textContent = 'मर्यादा पुरुषोत्तम श्री राम (विजयी स्वरूप 🚩)';
        } else {
            // Return to ready combat archer pose
            if (ramaPeacefulPose) {
                ramaPeacefulPose.style.opacity = '0';
                setTimeout(() => {
                    ramaPeacefulPose.style.display = 'none';
                }, 300);
            }
            if (ramaCombatPose) {
                setTimeout(() => {
                    ramaCombatPose.style.display = 'block';
                    setTimeout(() => {
                        ramaCombatPose.style.opacity = '1';
                    }, 50);
                }, 200);
            }
            ramaBox.classList.remove('rama-peaceful', 'rama-drawing');
            if (ramNameTag) ramNameTag.textContent = 'मर्यादा पुरुषोत्तम श्री राम';
        }
    }

    // ----------------------------------------------------
    // Trigger Ravan Vadh (Shoot Arrow Sequence)
    // ----------------------------------------------------
    function shootArrow() {
        if (isShooting || hasRavanDied) return;
        isShooting = true;

        window.soundEngine.init();

        // 1. Rama draws the bow
        shootBtn.disabled = true;
        shootBtn.style.opacity = '0.6';
        battleStatus.innerHTML = '<i class="fa-solid fa-crosshairs"></i> प्रभु श्री राम ने ब्रह्मास्त्र का संधान किया...';

        // Shankhnaad resonates as Shri Ram draws the bowstring
        window.soundEngine.playShankhNaad();

        ramaBox.classList.add('rama-drawing');

        // Draw bowstring back animation
        bowString.setAttribute('d', 'M220 30 L115 168 L225 325');
        loadedArrow.setAttribute('transform', 'translate(-25, 0)');

        ravanSpeechText.textContent = "नहीं! यह कौन सा अस्त्र है?!";

        // After pulling string back (700ms), bow snaps forward and arrow releases
        setTimeout(() => {
            // Bow string snaps forward
            bowString.setAttribute('d', 'M220 30 L235 168 L225 325');
            loadedArrow.style.display = 'none'; // Hide SVG arrow, spawn flying canvas arrow

            // Release sound: Crisp twang + synchronous arrow flight whoosh
            window.soundEngine.playBowTwang();
            window.soundEngine.playArrowFlight(0.85);

            battleStatus.innerHTML = '<i class="fa-solid fa-bolt"></i> दिव्य ब्रह्मास्त्र रावण की ओर बढ़ रहा है...';

            // Calculate start coordinates from Rama's bow
            const bowRect = bowString.getBoundingClientRect();
            const startX = bowRect.left + 20;
            const startY = bowRect.top + bowRect.height / 2;

            // Calculate target coordinates to Ravana's navel
            const navelRect = ravanNavelTarget.getBoundingClientRect();
            const targetX = navelRect.left + navelRect.width / 2;
            const targetY = navelRect.top + navelRect.height / 2;

            // Arrow flies for exactly 850ms, perfectly synchronized to audio flight sound
            activeArrow = new BrahmastraArrow(startX, startY, targetX, targetY, 850);

        }, 700);
    }

    // ----------------------------------------------------
    // Arrow Impact on Ravan (Visual + Audio Millisecond Sync)
    // ----------------------------------------------------
    function onArrowImpact() {
        hasRavanDied = true;
        battleStatus.innerHTML = '<i class="fa-solid fa-fire"></i> रावण की नाभि में बाण लगा! रावण दहन प्रारंभ!';

        // Sound: Instant blast impact & defeat moan
        window.soundEngine.playExplosion();
        setTimeout(() => window.soundEngine.playRavanDefeat(), 400);

        // Visual Impact shockwave
        const navelRect = ravanNavelTarget.getBoundingClientRect();
        const hitX = navelRect.left + navelRect.width / 2;
        const hitY = navelRect.top + navelRect.height / 2;

        // Optimized explosion burst particles
        const burstCount = window.innerWidth < 768 ? 45 : 75;
        for (let i = 0; i < burstCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            const colors = ['#FFF275', '#FFA502', '#FF4757', '#FFFFFF', '#C0392B'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(
                new Particle(hitX, hitY, color, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 4 + 2, 1, 0.025, 'fire')
            );
        }

        // Ravan starts shaking and catching fire
        ravanBox.classList.add('ravan-burning');
        ravanBurnOverlay.style.opacity = '0.9';
        ravanSpeechText.textContent = "हे राम! मेरा अहंकार टूट गया...";

        // Change Rama's position to normal peaceful blessing pose after Ravan Vadh
        setTimeout(() => {
            setRamaPose(true);
        }, 500);

        // Sequential heads destruction & firecracker cascade
        destroyRavanHeadsSequentially(hitX, hitY);
    }

    // ----------------------------------------------------
    // 10-Heads Destruction Sequence & Effigy Dahan
    // ----------------------------------------------------
    function destroyRavanHeadsSequentially(originX, originY) {
        const headsArray = Array.from(ravanHeads);
        // Cache SVG bounding box once to prevent 60fps layout thrashing
        const rRect = ravanSvg.getBoundingClientRect();

        // Continuous effigy fire (lightweight 120ms interval, no forced layout reflows)
        const fireInterval = setInterval(() => {
            const randX = rRect.left + Math.random() * rRect.width;
            const randY = rRect.top + Math.random() * rRect.height;

            const fireColors = ['#FFD700', '#FF3838', '#FF6B1A', '#FFF200', '#FFFFFF'];
            const c = fireColors[Math.floor(Math.random() * fireColors.length)];

            particles.push(
                new Particle(randX, randY, c, (Math.random() - 0.5) * 3, -Math.random() * 4 - 2, Math.random() * 4 + 2, 1, 0.025, 'fire')
            );
        }, 120);

        // Explode heads one after another in rhythmic synchronization
        headsArray.forEach((head, index) => {
            setTimeout(() => {
                const flyX = (index % 2 === 0 ? 1 : -1) * (45 + Math.random() * 55);
                head.style.setProperty('--fly-x', `${flyX}px`);
                head.classList.add('head-explode');
                
                // 1 distinct, crisp firecracker sound per head explosion!
                window.soundEngine.playFirecrackerPop();

                // Small burst at head
                const hRect = head.getBoundingClientRect();
                const pCount = window.innerWidth < 768 ? 8 : 14;
                for (let j = 0; j < pCount; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.5 + Math.random() * 3.5;
                    particles.push(
                        new Particle(
                            hRect.left + hRect.width / 2,
                            hRect.top + hRect.height / 2,
                            '#FFD700',
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            2.5,
                            1,
                            0.035,
                            'fire'
                        )
                    );
                }
            }, 550 + index * 240);
        });

        // After heads fall, effigy crumbles completely into ash
        setTimeout(() => {
            ravanBox.classList.remove('ravan-burning');
            ravanBox.classList.add('ravan-crumble');
            ravanSpeech.style.display = 'none';

            // Show Sky Victory Backdrop Banner ("सत्य की जीत, असत्य की हार!")
            if (skyVictoryBanner) skyVictoryBanner.classList.add('active');
            if (vsBadge) vsBadge.style.display = 'none';

            battleStatus.innerHTML = '<i class="fa-solid fa-trophy"></i> जय श्री राम! सत्य की जीत, असत्य की हार!';

            // Stop local fire burst generator
            clearInterval(fireInterval);

            // Grand Dussehra Celebration Fireworks & Victory Bells
            startGrandCelebration();

        }, 550 + headsArray.length * 240 + 750);
    }

    // ----------------------------------------------------
    // Grand Celebration (Full Screen Fireworks & Victory Modal)
    // ----------------------------------------------------
    function startGrandCelebration() {
        // Temple bells ring joyously
        window.soundEngine.playTempleBell(520);
        setTimeout(() => window.soundEngine.playTempleBell(659), 350);
        setTimeout(() => window.soundEngine.playTempleBell(784), 700);
        setTimeout(() => window.soundEngine.playTempleBell(1046), 1100);
        setTimeout(() => window.soundEngine.playShankhNaad(), 1400);

        // Continuous multi-colored fireworks show across screen (balanced interval)
        const celebrationTimer = setInterval(() => {
            const startX = Math.random() * canvas.width;
            const targetX = startX + (Math.random() - 0.5) * 180;
            const targetY = 80 + Math.random() * (canvas.height * 0.45);

            const palettes = [
                ['#FFD700', '#FFA502', '#FF4757', '#FFFFFF'],
                ['#2ECC71', '#1ABC9C', '#F1C40F', '#FFFFFF'],
                ['#9B59B6', '#E74C3C', '#F39C12', '#3498DB'],
                ['#FF7675', '#74B9FF', '#FFEAA7', '#55EFC4']
            ];
            const palette = palettes[Math.floor(Math.random() * palettes.length)];

            fireworks.push(new FireworkShell(startX, canvas.height, targetX, targetY, palette));
        }, 650);

        // Falling golden petals / confetti
        const petalTimer = setInterval(() => {
            const colors = ['#FFD700', '#FF9F43', '#FF6B6B', '#F8EFBA', '#FFFFFF'];
            for (let i = 0; i < 2; i++) {
                particles.push(
                    new Particle(
                        Math.random() * canvas.width,
                        -10,
                        colors[Math.floor(Math.random() * colors.length)],
                        (Math.random() - 0.5) * 1.5,
                        1 + Math.random() * 2,
                        Math.random() * 5 + 3,
                        1,
                        0.003,
                        'petal'
                    )
                );
            }
        }, 250);

        // Show Victory Modal after 2.5 seconds
        setTimeout(() => {
            victoryModal.classList.add('active');
            replayBtn.style.display = 'inline-flex';
        }, 2200);

        // Stop continuous heavy barrage after 20 seconds to save performance
        setTimeout(() => {
            clearInterval(celebrationTimer);
            clearInterval(petalTimer);
        }, 20000);
    }

    // ----------------------------------------------------
    // Reset / Replay Battle
    // ----------------------------------------------------
    function replayBattle() {
        isShooting = false;
        hasRavanDied = false;
        activeArrow = null;

        // Reset Rama
        shootBtn.disabled = false;
        shootBtn.style.opacity = '1';
        setRamaPose(false);
        bowString.setAttribute('d', 'M220 30 L146 168 L225 325');
        loadedArrow.setAttribute('transform', 'translate(0, 0)');
        loadedArrow.style.display = 'block';

        // Reset Ravan
        ravanBox.classList.remove('ravan-burning', 'ravan-crumble');
        ravanBurnOverlay.style.opacity = '0';
        ravanSpeech.style.display = 'block';
        ravanSpeechText.textContent = '"हा हा हा! मुझे कोई परास्त नहीं कर सकता!"';

        ravanHeads.forEach((head) => {
            head.classList.remove('head-explode');
            head.style.removeProperty('--fly-x');
        });

        // Reset Sky Victory Banner & VS badge
        if (skyVictoryBanner) skyVictoryBanner.classList.remove('active');
        if (vsBadge) vsBadge.style.display = 'flex';

        // Reset Status
        battleStatus.innerHTML = '<i class="fa-solid fa-scroll"></i> तीर चलाने के लिए ऊपर दिए गए बटन को दबाएं!';

        victoryModal.classList.remove('active');

        // Scroll smoothly back to battle
        document.getElementById('battleArena').scrollIntoView({ behavior: 'smooth' });
    }

    // ----------------------------------------------------
    // Name & Sharing System
    // ----------------------------------------------------
    function handleNameSubmission() {
        if (!nameInput) return;
        const val = nameInput.value.trim();
        if (val) {
            updateSenderName(val);
            const url = new URL(window.location);
            url.searchParams.set('name', val);
            window.history.replaceState({}, '', url);
            showToast(`शुभकामना अपडेट हो गई!`);
        }
    }

    if (generateBtn) generateBtn.addEventListener('click', handleNameSubmission);
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleNameSubmission();
        });
    }

    function getShareableUrl() {
        return window.location.href.split('?')[0];
    }

    function shareOnWhatsApp() {
        const url = getShareableUrl();
        const text = `🪔 *दीपावली एवं विजयदशमी की हार्दिक शुभकामनाएं!* 🪔\n\n` +
            `✨ अधर्म पर धर्म, असत्य पर सत्य और अंधकार पर प्रकाश की विजय के महापर्व पर आपको और आपके समस्त परिवार को हार्दिक शुभकामनाएं!\n\n` +
            `🏹 आपके लिए एक खास रावण दहन एवं विजय उत्सव एनीमेशन:\n\n` +
            `👇 *तीर चलाएं और उत्सव का आनंद लें:* \n${url}`;

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    }

    function copyGreetingLink() {
        const url = getShareableUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('शुभकामना लिंक कॉपी हो गया! अब WhatsApp पर भेजें।');
            }).catch(() => {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    }

    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('शुभकामना लिंक कॉपी हो गया!');
    }

    function showToast(msg) {
        toastAlert.querySelector('span').textContent = msg;
        toastAlert.style.display = 'flex';
        setTimeout(() => {
            toastAlert.style.display = 'none';
        }, 3500);
    }

    // ----------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------
    shootBtn.addEventListener('click', shootArrow);
    replayBtn.addEventListener('click', replayBattle);
    whatsappShareBtn.addEventListener('click', shareOnWhatsApp);
    copyLinkBtn.addEventListener('click', copyGreetingLink);

    modalWhatsappBtn.addEventListener('click', shareOnWhatsApp);
    modalCloseActionBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        replayBattle();
    });
    closeModalBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
    });

    // Tap on Ravan directly to shoot arrow too!
    ravanBox.addEventListener('click', () => {
        if (!isShooting && !hasRavanDied) {
            shootArrow();
        }
    });

    // Mobile Audio Instant Unlocker (wakes AudioContext on very first screen touch)
    const unlockAudio = () => {
        if (window.soundEngine) {
            window.soundEngine.init();
        }
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('touchend', unlockAudio);
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    window.addEventListener('touchend', unlockAudio, { passive: true, once: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
    window.addEventListener('click', unlockAudio, { passive: true, once: true });

    // Initialize from URL query parameters
    parseUrlName();

    // Generate night sky twinkling stars
    generateNightSkyStars();

})();
