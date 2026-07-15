const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abc\\Desktop\\Sterlingmere Holdings';

function updateCss() {
    const cssPath = path.join(dir, 'style.css');
    let css = fs.readFileSync(cssPath, 'utf8');

    // Update CSS variables
    css = css.replace(/--bg-main: #050505;/, '--bg-main: #0a0a0a;');
    css = css.replace(/--bg-secondary: #111111;/, '--bg-secondary: #141414;');
    css = css.replace(/--accent-1: #6366f1; \/\* Indigo \*\//, '--accent-1: #D4AF37; /* Gold */');
    css = css.replace(/--accent-2: #a855f7; \/\* Purple \*\//, '--accent-2: #8A6D3B; /* Dark Gold */');
    css = css.replace(/--accent-3: #ec4899; \/\* Pink \*\//, '--accent-3: #F9F1CC; /* Light Gold */');
    
    // Add heading font
    if (!css.includes("--font-heading:")) {
        css = css.replace(/--font-main: 'Inter', sans-serif;/, "--font-main: 'Inter', sans-serif;\n    --font-heading: 'Playfair Display', serif;");
    }

    // Apply heading font
    css = css.replace(/h1, h2, h3, h4 {/, 'h1, h2, h3, h4 {\n    font-family: var(--font-heading);');
    
    // Update text-gradient to just solid gold (or gold gradient)
    css = css.replace(/background: linear-gradient\(135deg, var\(--accent-1\), var\(--accent-3\)\);/, 'color: var(--accent-1);');
    css = css.replace(/-webkit-background-clip: text;/g, '');
    css = css.replace(/-webkit-text-fill-color: transparent;/g, '');
    css = css.replace(/background-clip: text;/g, '');

    // Update cursor glow
    css = css.replace(/rgba\(99, 102, 241, 0.15\)/g, 'rgba(212, 175, 55, 0.15)');
    css = css.replace(/rgba\(168, 85, 247, 0.05\)/g, 'rgba(212, 175, 55, 0.05)');

    // Update Buttons (Midnight & Gold Style)
    // Remove old btn-primary
    css = css.replace(/\.btn-primary \{[\s\S]*?box-shadow:[^\}]*?\}/, `.btn-primary {
    background-color: #1a1a1a;
    color: var(--accent-1);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 2px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.9);
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.4s ease, border-color 0.4s ease, color 0.4s ease;
}`);
    css = css.replace(/\.btn-primary:hover \{[\s\S]*?\}/, `.btn-primary:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,0.7);
    border-color: var(--accent-1);
    color: #fff;
}`);
    
    // Update btn-secondary (Outline Style)
    css = css.replace(/\.btn-secondary \{[\s\S]*?\}/, `.btn-secondary {
    background: transparent;
    color: var(--accent-1);
    border: 1px solid var(--accent-1);
    border-radius: 2px;
}`);
    css = css.replace(/\.btn-secondary:hover \{[\s\S]*?\}/, `.btn-secondary:hover {
    background: rgba(212, 175, 55, 0.1);
    color: var(--accent-1);
    transform: translateY(-2px);
}`);

    // Update general btn style to remove pill radius
    css = css.replace(/border-radius: 100px;/g, 'border-radius: 2px; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem;');

    // Hide projects after the 6th
    css += `\n\n/* View More Logic */
.portfolio-card.hidden {
    display: none;
}
.view-more-container {
    text-align: center;
    margin-top: 4rem;
}
`;

    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Updated style.css');
}

function updateHtml() {
    const htmlPath = path.join(dir, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Add Google Font
    if (!html.includes('Playfair+Display')) {
        html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">/, 
            `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">`);
    }

    // Add 7th Project (Real Estate)
    const newProject = `
                    <!-- Project 7: Real Estate -->
                    <div class="portfolio-card fade-up">
                        <div class="portfolio-img">
                            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800" alt="Luxury Real Estate">
                        </div>
                        <div class="portfolio-info">
                            <div class="portfolio-tags">
                                <span>Real Estate</span>
                                <span>Luxury</span>
                            </div>
                            <h3>Elysium Developments</h3>
                            <p>An ultra-premium, high-end digital portfolio for a billion-dollar luxury real estate developer.</p>
                            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                <a href="case-study-realestate.html" class="btn btn-primary" style="flex: 1; padding: 0.5rem; text-align: center; font-size: 0.9rem;">Read Case Study</a>
                                <a href="https://realestate-demosite.vercel.app/" class="btn btn-secondary" style="flex: 1; padding: 0.5rem; text-align: center; font-size: 0.9rem;" target="_blank">Live Demo &rarr;</a>
                            </div>
                        </div>
                    </div>`;
                    
    if (!html.includes('Project 7: Real Estate')) {
        html = html.replace(/(<\/div>\s*<\/div>\s*<!-- End Portfolio Grid -->)/, `${newProject}\n                $1`);
    }

    // Add View More Button
    const viewMoreBtn = `
                <div class="view-more-container fade-up">
                    <button id="viewMoreBtn" class="btn btn-outline" style="border: 1px solid var(--accent-1); color: var(--accent-1); background: transparent;">View More Projects</button>
                </div>`;
                
    if (!html.includes('id="viewMoreBtn"')) {
        html = html.replace(/<!-- End Portfolio Grid -->/, `<!-- End Portfolio Grid -->\n${viewMoreBtn}`);
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Updated index.html');
}

function updateJs() {
    const jsPath = path.join(dir, 'script.js');
    let js = fs.readFileSync(jsPath, 'utf8');

    const viewMoreScript = `

// View More Logic for Portfolio
document.addEventListener('DOMContentLoaded', () => {
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const viewMoreBtn = document.getElementById('viewMoreBtn');
    
    // Hide cards past index 5 (the 6th card)
    portfolioCards.forEach((card, index) => {
        if (index > 5) {
            card.classList.add('hidden');
        }
    });

    if (viewMoreBtn) {
        if (portfolioCards.length <= 6) {
            viewMoreBtn.style.display = 'none';
        } else {
            viewMoreBtn.addEventListener('click', () => {
                portfolioCards.forEach(card => card.classList.remove('hidden'));
                viewMoreBtn.style.display = 'none';
                
                // Re-trigger scroll animations for newly revealed cards if needed
                setTimeout(() => {
                    window.dispatchEvent(new Event('scroll'));
                }, 100);
            });
        }
    }
});
`;

    if (!js.includes('viewMoreBtn')) {
        fs.appendFileSync(jsPath, viewMoreScript, 'utf8');
        console.log('Updated script.js');
    }
}

updateCss();
updateHtml();
updateJs();
