document.addEventListener('DOMContentLoaded', () => {

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.hero-content, .dna-block, .product-card, .story-text, .manifesto-content');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // --- Mobile Menu ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.querySelector('i').classList.replace('ph-x', 'ph-list');
            });
        });
    }

    // --- Product Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catalogGrid = document.getElementById('catalog-grid');

    if (catalogGrid) {
        const catalogItems = catalogGrid.querySelectorAll('.product-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                btn.classList.add('active');

                const category = btn.getAttribute('data-filter');

                catalogItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');

                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'block';
                        // Add fade animation for re-appearing items
                        item.animate([
                            { opacity: 0, transform: 'scale(0.95)' },
                            { opacity: 1, transform: 'scale(1)' }
                        ], {
                            duration: 300,
                            easing: 'ease-out',
                            fill: 'forwards'
                        });
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Product Modal ---
    const modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    // Select all product cards (both in collections and catalog)
    // We use event delegation or re-query. Re-querying is fine here.
    const allProductCards = document.querySelectorAll('.product-card');

    // Modal Elements
    const mImg = document.getElementById('modalImg');
    const mTitle = document.getElementById('modalTitle');
    const mSci = document.getElementById('modalSciName');
    const mPrice = document.getElementById('modalPrice');

    const openModal = (card) => {
        const img = card.querySelector('img').src;
        const title = card.querySelector('h3').innerText;
        const sci = card.querySelector('.scientific-name').innerText;
        const price = card.querySelector('.price').innerText;

        mImg.src = img;
        mTitle.innerText = title;
        mSci.innerText = sci;
        mPrice.innerText = price;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeProductModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    };

    allProductCards.forEach(card => {
        card.addEventListener('click', () => openModal(card));
    });

    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }

    // --- Shopping Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('eukariae_cart')) || []; // Load from storage
    const cartBadge = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const closeCartBtn = document.querySelector('.close-cart');
    const openCartBtn = document.querySelector('.nav-actions button[aria-label="Carrito"]');

    // Select Checkout Button in DOM (for Index page)
    const checkoutBtn = document.querySelector('.cart-footer .btn');

    const saveCart = () => {
        localStorage.setItem('eukariae_cart', JSON.stringify(cart));
        updateCartUI(); // Update UI whenever saved
    };

    // Create Toast Element (if not exists)
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    const showToast = (message) => {
        toast.innerHTML = `<i class="ph ph-check-circle"></i> ${message}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const updateCartUI = () => {
        // Calculate Total Quantity for Badge
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

        // Update Badge
        if (cartBadge) {
            cartBadge.innerText = totalItems;
            if (totalItems > 0) cartBadge.classList.add('visible');
            else cartBadge.classList.remove('visible');
        }

        // Render Sidebar Items (only if container exists)
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.</div>';
            } else {
                cart.forEach((item, index) => {
                    const priceNumber = parseInt(item.price.replace(/[$.]/g, ''));
                    total += priceNumber * item.quantity;

                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.innerHTML = `
                        <img src="${item.img}" class="cart-item-img" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <span class="cart-item-price">$${(priceNumber * item.quantity).toLocaleString('es-CO')}</span>
                            <div class="cart-controls">
                                <button class="qty-btn decrease" data-index="${index}"><i class="ph ph-minus"></i></button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn increase" data-index="${index}"><i class="ph ph-plus"></i></button>
                            </div>
                        </div>
                        <button class="icon-btn remove-item-btn" data-index="${index}"><i class="ph ph-trash"></i></button>
                    `;
                    cartItemsContainer.appendChild(itemEl);
                });

                // Add event listeners for controls
                cartItemsContainer.querySelectorAll('.increase').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.currentTarget.getAttribute('data-index');
                        cart[index].quantity++;
                        saveCart();
                    });
                });

                cartItemsContainer.querySelectorAll('.decrease').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.currentTarget.getAttribute('data-index');
                        if (cart[index].quantity > 1) {
                            cart[index].quantity--;
                        } else {
                            // Optional: Remove if 1? Or just stay at 1. User has trash button.
                            // Let's stay at 1 to prevent accidental removal.
                        }
                        saveCart();
                    });
                });

                cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.currentTarget.getAttribute('data-index');
                        cart.splice(index, 1);
                        saveCart();
                    });
                });
            }

            // Format Total
            if (cartTotalValue) {
                cartTotalValue.innerText = '$' + total.toLocaleString('es-CO');
            }
        }
    };

    // Initialize UI on load
    updateCartUI();

    const toggleCart = () => {
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
            if (cartBackdrop) cartBackdrop.classList.toggle('open');
            document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : 'auto';
        }
    };

    // Redirect to Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast('Tu carrito está vacío');
            }
        });
    }

    if (openCartBtn) openCartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', toggleCart);

    // Modal Add Button logic
    const modalAddBtn = document.querySelector('.modal-details .btn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
            const title = document.getElementById('modalTitle').innerText;
            const price = document.getElementById('modalPrice').innerText;
            const img = document.getElementById('modalImg').src;

            // Check duplicate
            const existingItem = cart.find(item => item.title === title);

            if (existingItem) {
                existingItem.quantity++;
                showToast(`+1 ${title} (Total: ${existingItem.quantity})`);
            } else {
                cart.push({ title, price, img, quantity: 1 });
                showToast(`${title} añadido`);
            }

            saveCart();
            if (typeof closeProductModal === 'function') setTimeout(closeProductModal, 300);
        });
    }

    // --- Checkout Page Logic (if on checkout page) ---
    const checkoutGrid = document.querySelector('.checkout-grid');
    if (checkoutGrid) {
        const summaryContainer = document.getElementById('checkout-summary-items');
        const finalTotal = document.getElementById('checkout-total');
        const checkoutForm = document.getElementById('checkout-form');

        let total = 0;
        if (cart.length === 0) {
            // Redirect if empty? or show message
            if (summaryContainer) summaryContainer.innerHTML = '<p>No hay productos.</p>';
        } else {
            if (summaryContainer) {
                summaryContainer.innerHTML = '';
                cart.forEach(item => {
                    const priceNumber = parseInt(item.price.replace(/[$.]/g, ''));
                    total += priceNumber;

                    const div = document.createElement('div');
                    div.className = 'summary-item';
                    div.innerHTML = `
                        <div style="display:flex; gap:1rem; align-items:center;">
                            <img src="${item.img}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                            <div>
                                <p style="font-weight:500; font-size:0.9rem;">${item.title}</p>
                                <p style="font-size:0.8rem; color: #888;">${item.price}</p>
                            </div>
                        </div>
                    `;
                    summaryContainer.appendChild(div);
                });

                if (finalTotal) finalTotal.innerText = '$' + total.toLocaleString('es-CO');
            }
        }

        if (checkoutForm) {
            // Payment Method Toggling
            const paymentOptions = document.querySelectorAll('.payment-option');
            const cardDetails = document.getElementById('payment-card-details');
            const pseDetails = document.getElementById('payment-pse-details');
            const cardInputs = cardDetails.querySelectorAll('input');

            paymentOptions.forEach(opt => {
                opt.addEventListener('click', () => {
                    // Toggle Active Visuals
                    paymentOptions.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');

                    // Toggle Sections
                    const method = opt.getAttribute('data-method');
                    if (method === 'card') {
                        cardDetails.style.display = 'block';
                        pseDetails.style.display = 'none';
                        // Enable required for card inputs
                        cardInputs.forEach(i => i.required = true);
                    } else {
                        cardDetails.style.display = 'none';
                        pseDetails.style.display = 'block';
                        // Disable required for card inputs so form can validate
                        cardInputs.forEach(i => i.required = false);
                    }
                });
            });

            // Card Input Masking
            const cardNumInput = document.getElementById('card-number');
            const cardExpiryInput = document.getElementById('card-expiry');

            if (cardNumInput) {
                cardNumInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    value = value.replace(/(.{4})/g, '$1 ').trim(); // Add space every 4 chars
                    e.target.value = value;
                });
            }

            if (cardExpiryInput) {
                cardExpiryInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                });
            }

            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Simulate processing
                const btn = checkoutForm.querySelector('button[type="submit"]');

                // Simple validation check just in case browser miss it
                if (checkoutForm.checkValidity()) {
                    btn.innerText = 'Procesando pago...';
                    btn.disabled = true;
                    btn.style.opacity = '0.7';

                    setTimeout(() => {
                        // Show Custom Success Modal
                        const successModal = document.getElementById('successModal');
                        const successBackdrop = document.getElementById('successBackdrop');

                        if (successModal && successBackdrop) {
                            successModal.classList.add('open');
                            successBackdrop.classList.add('open');

                            // Clear Cart Data
                            localStorage.removeItem('eukariae_cart');

                            // Close Logic
                            const closeBtn = document.getElementById('successCloseBtn');

                            const redirectToHome = () => {
                                window.location.href = 'index.html';
                            };

                            if (closeBtn) closeBtn.addEventListener('click', redirectToHome);
                            successBackdrop.addEventListener('click', redirectToHome);
                        } else {
                            // Fallback
                            alert('¡Pago exitoso! Tu pedido ha sido confirmado.');
                            localStorage.removeItem('eukariae_cart');
                            window.location.href = 'index.html';
                        }
                    }, 2500);
                } else {
                    alert('Por favor completa todos los campos requeridos.');
                }
            });
        }
    }

    // --- Smooth Scroll for Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

});

