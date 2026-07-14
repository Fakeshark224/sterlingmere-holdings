// script.js

// Initialize EmailJS safely
if (typeof emailjs !== 'undefined') {
    emailjs.init('GOp1gJ7fwI2fpQuj3');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Scroll Animations using Intersection Observer
    const animatedElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Mobile Menu Toggle (Basic implementation)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(5, 5, 5, 0.95)';
                navLinks.style.padding = '2rem';
                navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            }
        });
        
        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
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

            // Prepare the template parameters from the form inputs
            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                message: "Project Type: " + document.getElementById('project-type').value + "\n\n" + document.getElementById('message').value,
                to_email: 'sterlingmereholdings@gmail.com'
            };
            
            // Send email using EmailJS
            emailjs.send('service_wnetbld', 'template_qwipc5i', templateParams)
                .then(() => {
                    // Success
                    btn.textContent = 'Message Sent!';
                    btn.style.background = '#10b981'; // Success green
                    btn.style.opacity = '1';
                    contactForm.reset();
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                }, (error) => {
                    // Error
                    console.error('Failed to send email:', error);
                    btn.textContent = 'Error! Try Again.';
                    btn.style.background = '#ef4444'; // Error red
                    btn.style.opacity = '1';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }

    // 5. Custom Mouse Follower Glow
    const cursorGlow = document.createElement('div');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorGlow);

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

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

    // 6. Initialize Vanilla Tilt for 3D Cards
    if (typeof VanillaTilt !== 'undefined') {
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
