import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial sizing

        // --- Configuration ---
        const LAYER_COUNT = 3; // depth layers
        const START_COUNT = Math.min(120, (width * height) / 9000); // Responsive

        // Mouse State
        const mouse = { x: -1000, y: -1000, radius: 200 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        // --- Particle Class ---
        class Particle {
            constructor() {
                this.init(true);
            }

            init(randomY = false) {
                this.x = Math.random() * width;
                this.y = randomY ? Math.random() * height : -20; // Start at top if re-spawning, or random if init

                // Depth: 0 = far, 1 = near
                this.depth = Math.random();

                // Size & Opacity based on depth
                // Nearer = Bigger & Brighter
                this.size = (Math.random() * 1.5 + 0.5) * (this.depth + 0.5);

                // Speed based on depth (Parallax: Nearer = Faster)
                const speedMult = (this.depth * 0.8) + 0.2;
                this.vx = (Math.random() - 0.5) * 0.5 * speedMult;
                this.vy = (Math.random() * 0.5 + 0.1) * speedMult; // Always drift down slightly

                // Interaction Properties
                this.baseVx = this.vx;
                this.baseVy = this.vy;
                this.friction = 0.96; // Smooth damping
            }

            update() {
                // Mouse Interaction (Soft Repel/Flow)
                // We calculate distance to mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Only interact if close (and not too deep/far)
                if (distance < mouse.radius && this.depth > 0.3) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;

                    // Push away gently
                    const pushStrength = 0.6 * this.depth;
                    this.vx -= forceDirectionX * force * pushStrength;
                    this.vy -= forceDirectionY * force * pushStrength;
                }

                // Apply velocity
                this.x += this.vx;
                this.y += this.vy;

                // Friction to return to nominal speed (damping)
                // This makes the particles "recover" smoothly after being pushed
                this.vx = this.vx * this.friction + (this.baseVx * (1 - this.friction));
                this.vy = this.vy * this.friction + (this.baseVy * (1 - this.friction));

                // Wrap around screen
                if (this.x < -50) this.x = width + 50;
                if (this.x > width + 50) this.x = -50;
                if (this.y > height + 50) this.y = -50;
                // If fell off bottom, re-init at top
                if (this.y > height + 20) {
                    this.init(false); // respawn at top
                    this.y = -20;
                }
            }

            draw() {
                // Opacity based on depth (fades distant stars)
                // Layer colors: Deep Blue/Purple tint
                const alpha = (this.depth * 0.5) + 0.1;
                ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`; // Blue-300ish
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize Particles
        const particles = [];
        for (let i = 0; i < START_COUNT; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // 1. Update & Draw Particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // 2. Draw Connections (Only for "Near" particles to avoid clutter)
            const nearParticles = particles.filter(p => p.depth > 0.6);

            ctx.lineWidth = 0.5;
            for (let a = 0; a < nearParticles.length; a++) {
                for (let b = a; b < nearParticles.length; b++) {
                    const dx = nearParticles[a].x - nearParticles[b].x;
                    const dy = nearParticles[a].y - nearParticles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Connect if close
                    if (distance < 120) {
                        // Opacity based on distance AND combined depth
                        const opacity = (1 - distance / 120) * 0.15;
                        ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(nearParticles[a].x, nearParticles[a].y);
                        ctx.lineTo(nearParticles[b].x, nearParticles[b].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', () => { });
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default ParticlesBackground;
