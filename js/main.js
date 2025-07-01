// Side navigation functionality
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideNav');
const sideNavClose = document.getElementById('sideNavClose');
const body = document.body;

menuBtn.addEventListener('click', () => {
    sideNav.classList.add('open');
    body.classList.add('sidebar-open');
});

sideNavClose.addEventListener('click', () => {
    sideNav.classList.remove('open');
    body.classList.remove('sidebar-open');
});

// Close side nav when clicking on a link
document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', () => {
        sideNav.classList.remove('open');
        body.classList.remove('sidebar-open');
    });
});

// Cart functionality
let cart = [];
const cartBtn = document.getElementById('cartBtn');
const cartContainer = document.getElementById('cartContainer');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

// Initialize cart from localStorage if available
if (localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    updateCart();
}

// Toggle cart visibility
cartBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('open');
});

cartClose.addEventListener('click', () => {
    cartContainer.classList.remove('open');
});

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const item = {
            name: e.target.dataset.name,
            price: parseFloat(e.target.dataset.price),
            quantity: 1
        };

        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        updateCart();
        showAddedToCartMessage(item.name);
        cartContainer.classList.add('open');
    });
});

// Update cart display
function updateCart() {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        checkoutBtn.style.display = 'none';
        clearCartBtn.style.display = 'none';
    } else {
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} AED</div>
                <div class="cart-item-quantity">
                    <button class="decrease-quantity" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity" data-index="${index}">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItemElement);
        });

        // Show checkout and clear buttons
        checkoutBtn.style.display = 'block';
        clearCartBtn.style.display = 'block';
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total} AED`;

    // Add event listeners to quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            cart[index].quantity += 1;
            updateCart();
        });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            updateCart();
        });
    });

    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            updateCart();
        });
    });
}

// Clear cart
clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCart();
});

// Checkout via WhatsApp
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    let message = "Hello Aroma Food Nest! I'd like to place an order:\n\n";

    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity}x) - ${item.price * item.quantity} AED\n`;
    });

    message += `\nTotal: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} AED`;
    message += "\n\nPlease let me know if you need any additional information. Thank you!";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/971527055642?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
});

// Show "Added to cart" message
function showAddedToCartMessage(itemName) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'var(--gold)';
    notification.style.color = 'var(--dark)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '50px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.fontWeight = '600';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.innerHTML = `<i class="fas fa-check"></i> ${itemName} added to cart!`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Mobile Navigation Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');

mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
});

mobileNavClose.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
});

// Close mobile nav when clicking on a link
document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"], a[href^="/"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only prevent default for hash links
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Scroll behavior for navigation
window.addEventListener('scroll', function() {
    const nav = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // Parallax effect for header
    const scrollPosition = window.pageYOffset;
    document.querySelector('header').style.backgroundPositionY = scrollPosition * 0.7 + 'px';
});

// 3D tilt effect for cards
document.querySelectorAll('.package-card, .cuisine-card, .event-card, .menu-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const angleX = (y - centerY) / 20;
        const angleY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Scroll animations
const animatedElements = document.querySelectorAll('.animate-on-scroll');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
});

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

// Micro-interactions for buttons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-5px) scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0) scale(1)';
    });
});

// Animate menu items sequentially
document.querySelectorAll('.menu-item').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
});

// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendar')) {
        const calendarEl = document.getElementById('calendar');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();

        // Generate calendar HTML
        async function generateCalendar() {
            // In a real implementation, you would fetch booked dates from your backend
            const bookedDates = []; // This would come from your API

            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];

            // Update calendar title
            document.querySelector('.calendar-title').textContent =
                `${monthNames[currentMonth]} ${currentYear}`;

            let calendarHTML = `
                <div class="calendar-grid">
                    <div class="day-header">Sun</div>
                    <div class="day-header">Mon</div>
                    <div class="day-header">Tue</div>
                    <div class="day-header">Wed</div>
                    <div class="day-header">Thu</div>
                    <div class="day-header">Fri</div>
                    <div class="day-header">Sat</div>
            `;

            // Empty cells for days before the first day of the month
            for (let i = 0; i < startingDay; i++) {
                calendarHTML += `<div class="calendar-day empty"></div>`;
            }

            // Days of the month
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isBooked = bookedDates.includes(dateStr);
                const isToday = today.getFullYear() === currentYear &&
                            today.getMonth() === currentMonth &&
                            today.getDate() === day;

                calendarHTML += `
                    <div class="calendar-day ${isBooked ? 'booked' : ''} ${isToday ? 'today' : ''}">
                        ${day}
                    </div>
                `;
            }

            calendarHTML += `</div>`;
            calendarEl.innerHTML = calendarHTML;
        }

        // Navigation buttons
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        });

        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar();
        });

        // Initialize calendar
        generateCalendar();
    }
});