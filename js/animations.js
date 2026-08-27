// 動畫控制器
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initParticles();
    initCounters();
    initTypewriter();
});

// 1. 滾動動畫 (Intersection Observer)
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // 觸發後即取消觀察，確保只播放一次
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el, index) => {
        // 卡片網格的交錯動畫效果
        if (el.classList.contains('stagger-item')) {
            el.style.transitionDelay = `${(index % 10) * 100}ms`;
        }
        observer.observe(el);
    });
}

// 2. 數字跳動動畫
function initCounters() {
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // 使用 easeOutQuart 緩動函數讓動畫更自然
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(easeProgress * (end - start) + start);
        
        // 加上千分位逗號
        obj.innerHTML = currentVal.toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end.toLocaleString();
        }
    };
    window.requestAnimationFrame(step);
}

// 3. Hero 區塊粒子背景
function initParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    const colors = ['#00b4d8', '#9b5de5', '#2ec4b6', '#f72585'];

    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = Math.random() * -1 - 0.5; // 向上移動
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.y < 0) {
                this.y = height;
                this.x = Math.random() * width;
            }
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        const numParticles = Math.min(Math.floor(window.innerWidth / 15), 100);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    createParticles();

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = particles[i].color;
                    ctx.globalAlpha = (120 - distance) / 120 * 0.2;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    function animate() {
        if (isVisible) {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            drawLines();
        }
        requestAnimationFrame(animate);
    }

    animate();

    // 4. Parallax 視差效果
    window.addEventListener('scroll', () => {
        if (window.scrollY < height) {
            const yPos = -(window.scrollY * 0.3);
            canvas.style.transform = `translateY(${yPos}px)`;
        }
    });
}

// 5. 打字機效果
function initTypewriter() {
    const title = document.querySelector('.typewriter-text');
    if (!title) return;
    
    const text = title.getAttribute('data-text') || title.innerText;
    title.innerText = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            title.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            title.classList.add('typing-done');
        }
    }
    
    setTimeout(typeWriter, 500);
}
