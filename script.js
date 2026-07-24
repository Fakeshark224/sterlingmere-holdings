// script.js

// Initialize EmailJS safely
if (typeof emailjs !== 'undefined') {
    emailjs.init('GOp1gJ7fwI2fpQuj3');
}

// Check for touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect (Hide on down, show on up)
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            // Add glassmorphism
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/Show logic
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        });
    }

    // 2. Premium Staggered Scroll Animations
    // Support all animation classes
    const animationSelectors = '.fade-up, .fade-in, .slide-left, .slide-right, .scale-in';
    const allAnimatedElements = Array.from(document.querySelectorAll(animationSelectors));
    const staggerContainers = document.querySelectorAll('[data-stagger="true"]');
    
    // Remove elements that are inside stagger containers from the main list, 
    // because we will handle them separately
    const independentElements = allAnimatedElements.filter(el => {
        return !el.closest('[data-stagger="true"]');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it's a stagger container, stagger its children
                if (entry.target.hasAttribute('data-stagger')) {
                    const children = entry.target.querySelectorAll(animationSelectors);
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 120);
                    });
                } else {
                    entry.target.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    independentElements.forEach(el => observer.observe(el));
    staggerContainers.forEach(container => observer.observe(container));

    // 3. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            // Lock body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. Form Submission Handler with EmailJS
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            // Show sending state
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                message: "Project Type: " + document.getElementById('project-type').value + "\n\n" + document.getElementById('message').value,
                to_email: 'sterlingmereholdings@gmail.com'
            };
            
            emailjs.send('service_wnetbld', 'template_qwipc5i', templateParams)
                .then(() => {
                    btn.textContent = 'Message Sent!';
                    btn.style.background = '#10b981';
                    btn.style.opacity = '1';
                    contactForm.reset();
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                }, (error) => {
                    console.error('Failed to send email:', error);
                    btn.textContent = 'Error! Try Again.';
                    btn.style.background = '#ef4444';
                    btn.style.opacity = '1';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }

    // 5. Magnetic Button Effect (Desktop Only)
    if (!isTouchDevice) {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Check if within 100px radius
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Pull toward cursor
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // 6. Custom Mouse Follower Glow (Desktop Only)
    if (!isTouchDevice) {
        const cursorGlow = document.createElement('div');
        cursorGlow.classList.add('cursor-glow');
        document.body.appendChild(cursorGlow);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            // Smoothly interpolate current glow position to mouse position
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            
            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        // Enlarge glow when hovering over buttons or cards
        const interactiveElements = document.querySelectorAll('a, button, .portfolio-card, .service-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorGlow.style.width = '600px';
                cursorGlow.style.height = '600px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(0, 0, 0, 0) 70%)';
            });
            el.addEventListener('mouseleave', () => {
                cursorGlow.style.width = '400px';
                cursorGlow.style.height = '400px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(0, 0, 0, 0) 70%)';
            });
        });
    }

    // 7. Initialize Vanilla Tilt for 3D Cards
    if (typeof VanillaTilt !== 'undefined' && !isTouchDevice) {
        VanillaTilt.init(document.querySelectorAll(".service-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });

        VanillaTilt.init(document.querySelectorAll(".portfolio-card"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
            scale: 1.02
        });
    }
});

// FAQ Accordion Logic
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            otherItem.classList.remove('active');
        });

        // Toggle current FAQ
        if (!isActive) {
            item.classList.add('active');
        }
    });
});
