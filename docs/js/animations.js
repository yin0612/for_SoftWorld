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

// 3. 創生日系質感漂浮圓粒背景
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let width = canvas.width = container.offsetWidth || window.innerWidth;
    let height = canvas.height = container.offsetHeight || window.innerHeight;

    const particles = [];
    const particleCount = 45;
    const colors = ['rgba(74, 124, 89, 0.25)', 'rgba(91, 146, 229, 0.25)', 'rgba(244, 162, 97, 0.25)'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 0.4 + 0.1,
            speedX: (Math.random() - 0.5) * 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y -= p.speedY;
            p.x += p.speedX;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = container.offsetWidth || window.innerWidth;
        height = canvas.height = container.offsetHeight || window.innerHeight;
    });

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
