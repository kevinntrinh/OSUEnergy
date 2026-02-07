// ===================================
// SMOOTH SCROLLING
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.module-card, .info-card, .workflow-step, .metric-box');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});

// ===================================
// ACTIVE NAVIGATION HIGHLIGHT
// ===================================
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

setActiveNav();

// ===================================
// INTERACTIVE MODULE CARDS
// ===================================
document.querySelectorAll('.module-card:not(.coming-soon)').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===================================
// PROGRESS BAR ANIMATION
// ===================================
function animateProgressBars() {
    document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) {
            setTimeout(() => {
                bar.style.width = width + '%';
            }, 300);
        }
    });
}

// ===================================
// CHART DATA VISUALIZATION
// ===================================
function createSimpleBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const chartHTML = data.map(item => `
        <div class="bar-item" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--text-secondary);">${item.label}</span>
                <span style="color: var(--accent-color); font-weight: 600;">${item.value} ${options.unit || ''}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" data-width="${(item.value / maxValue) * 100}" style="width: 0%;">
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = chartHTML;
    animateProgressBars();
}

// ===================================
// NUMBER COUNTER ANIMATION
// ===================================
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Animate stat numbers on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const text = stat.textContent;
        const number = parseInt(text);
        if (!isNaN(number)) {
            stat.textContent = '0';
            setTimeout(() => animateCounter(stat, number), 500);
        }
    });
});

// ===================================
// TOOLTIP SYSTEM
// ===================================
function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--card-bg);
        color: var(--text-primary);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--accent-color);
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 15px var(--shadow);
    `;
    return tooltip;
}

// Add tooltips to elements with data-tooltip attribute
document.querySelectorAll('[data-tooltip]').forEach(element => {
    const tooltip = createTooltip(element.getAttribute('data-tooltip'));
    document.body.appendChild(tooltip);

    element.addEventListener('mouseenter', (e) => {
        tooltip.style.opacity = '1';
    });

    element.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
    });

    element.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });
});

// ===================================
// COPY TO CLIPBOARD
// ===================================
document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.className = 'copy-btn';
    copyBtn.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        background: var(--accent-color);
        color: var(--primary-bg);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.3s ease;
    `;
    
    block.style.position = 'relative';
    block.appendChild(copyBtn);

    copyBtn.addEventListener('click', () => {
        const code = block.querySelector('pre').textContent;
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
    });
});

// ===================================
// FILTER FUNCTIONALITY
// ===================================
function filterCards(filterValue) {
    document.querySelectorAll('.module-card, .info-card').forEach(card => {
        if (filterValue === 'all' || card.dataset.category === filterValue) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.module-card, .info-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const content = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

setupSearch();

// ===================================
// LOADING ANIMATION
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===================================
// DARK MODE TOGGLE (Optional Enhancement)
// ===================================
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Check for saved theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// ===================================
// EXPORT FUNCTIONS FOR OTHER PAGES
// ===================================
window.energyPlatform = {
    createSimpleBarChart,
    animateCounter,
    filterCards,
    animateProgressBars
};

console.log('🔋 OSU Energy Analytics Platform Loaded Successfully');
