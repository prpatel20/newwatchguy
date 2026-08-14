/**
 * NewWatchGuy - Premium Luxury Watch Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Enhancement
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }, { passive: true });
    }

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('nav a');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
        });
    });

    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-open') && 
            !e.target.closest('nav') && 
            !e.target.closest('.hamburger')) {
            document.body.classList.remove('nav-open');
        }
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Stagger grid children logic for elements needing staggered animations
    const staggerGrids = document.querySelectorAll('.stagger-grid');
    staggerGrids.forEach(grid => {
        Array.from(grid.children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
        });
    });

    // 4. Search Toggle
    const searchIcon = document.querySelector('.search-icon');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');

    if (searchIcon && searchForm) {
        searchIcon.addEventListener('click', () => {
            searchForm.classList.toggle('active');
            if (searchForm.classList.contains('active') && searchInput) {
                searchInput.focus();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchForm.classList.contains('active')) {
                searchForm.classList.remove('active');
            }
        });
    }

    // 5. Category Horizontal Scroll (Mobile)
    const categoryScroll = document.querySelector('.category-scroll');
    if (categoryScroll) {
        let isDown = false;
        let startX;
        let scrollLeft;

        categoryScroll.addEventListener('mousedown', (e) => {
            isDown = true;
            categoryScroll.classList.add('active'); // active class can style custom cursor
            startX = e.pageX - categoryScroll.offsetLeft;
            scrollLeft = categoryScroll.scrollLeft;
        });
        categoryScroll.addEventListener('mouseleave', () => {
            isDown = false;
            categoryScroll.classList.remove('active');
        });
        categoryScroll.addEventListener('mouseup', () => {
            isDown = false;
            categoryScroll.classList.remove('active');
        });
        categoryScroll.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - categoryScroll.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            categoryScroll.scrollLeft = scrollLeft - walk;
        });
    }

    // 6. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = document.querySelector('.newsletter-email');
    const successMessage = document.querySelector('.newsletter-success');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput ? emailInput.value.trim() : '';
            // Basic client-side email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(email)) {
                newsletterForm.classList.add('submitted');
                // Could hide form or keep it depending on design
                if (successMessage) {
                    successMessage.classList.add('show');
                    successMessage.textContent = 'Thank you for subscribing!';
                }
            } else {
                if (emailInput) {
                    emailInput.classList.add('error');
                    setTimeout(() => emailInput.classList.remove('error'), 3000);
                }
            }
        });
    }

    // 8. Counter Animation
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const updateCount = () => {
                    const targetValue = +target.getAttribute('data-target');
                    const count = +target.innerText;
                    const speed = 100; // Determine animation speed
                    const inc = targetValue / speed;

                    if (count < targetValue) {
                        target.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        target.innerText = targetValue;
                    }
                };
                updateCount();
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counter.innerText = '0';
        counterObserver.observe(counter);
    });

    // 9. Image Lazy Loading Enhancement
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        img.classList.add('img-loading'); // Will have opacity: 0 in CSS
        
        if (img.complete) {
            img.classList.add('img-loaded'); // Opacity: 1 with transition in CSS
            img.classList.remove('img-loading');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('img-loaded');
                img.classList.remove('img-loading');
            });
        }
    });

    // 10. Wishlist Toggle with localStorage
    // Using event delegation attached to the body or a main container
    let wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    const updateWishlistUI = () => {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.id;
            if (wishlistItems.includes(productId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist-btn');
        if (btn) {
            e.preventDefault();
            const productId = btn.dataset.id;
            if (!productId) return;
            
            if (wishlistItems.includes(productId)) {
                wishlistItems = wishlistItems.filter(id => id !== productId);
            } else {
                wishlistItems.push(productId);
            }
            
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            updateWishlistUI();
        }
    });

    // Initialize wishlist state on load
    updateWishlistUI();

    // 11. Back to Top Button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '&#8679;'; // Simple up arrow
    backToTopBtn.classList.add('back-to-top');
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
