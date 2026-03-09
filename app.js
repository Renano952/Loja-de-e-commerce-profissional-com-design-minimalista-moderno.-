// ========== ESTADO DA APLICAÇÃO ==========
let cart = [];
let products = [];
let filteredProducts = [];

// Carregar carrinho do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
    setupEventListeners();
    updateCartUI();
});

// ========== CARREGAR PRODUTOS ==========
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        filteredProducts = [...products];
        displayProducts(products);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        displayError();
    }
}

// ========== EXIBIR PRODUTOS ==========
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (productsToDisplay.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = productsToDisplay.map(product => `
        <div class="product-card">
            <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating)}</span>
                    <span>${product.rating}</span>
                    <span>(${product.reviews} avaliações)</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== CARRINHO DE COMPRAS ==========
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();
    
    // Feedback visual
    showNotification('Produto adicionado ao carrinho!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCartToStorage();
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');

    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';

    // Exibir itens
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remover</button>
                </div>
            </div>
        </div>
    `).join('');

    // Atualizar resumo
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    // Carrinho sidebar
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('shipping').textContent = formatCurrency(shipping);
    document.getElementById('total').textContent = formatCurrency(total);

    // Modal checkout
    document.getElementById('checkoutSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('checkoutShipping').textContent = formatCurrency(shipping);
    document.getElementById('checkoutTotal').textContent = formatCurrency(total);
}

function calculateShipping(subtotal) {
    if (subtotal === 0) return 0;
    if (subtotal > 500) return 0; // Frete grátis acima de R$ 500
    return 29.90; // Taxa fixa
}

// ========== ARMAZENAMENTO LOCAL ==========
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// ========== MODAIS E CHECKOUT ==========
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Carrinho vazio!', 'error');
        return;
    }

    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    updateCartSummary();
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('modalOverlay').classList.toggle('active');
}

// ========== PROCESSAMENTO DE PAGAMENTO ==========
document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar formulário
    const formData = new FormData(e.target);
    const paymentMethod = formData.get('payment');

    // Simular processamento
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true;
    payBtn.textContent = 'Processando...';

    try {
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular chamada de API (como Stripe)
        const orderData = {
            orderId: generateOrderId(),
            customer: {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                cpf: document.getElementById('cpf').value
            },
            address: {
                street: document.getElementById('address').value,
                number: document.getElementById('number').value,
                complement: document.getElementById('complement').value,
                zipcode: document.getElementById('cep').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value
            },
            items: cart,
            payment: {
                method: paymentMethod,
                amount: calculateTotal()
            },
            timestamp: new Date().toISOString()
        };

        // Simular resposta da API
        console.log('Pedido processado:', orderData);

        // Enviar para servidor (com autenticação Stripe)
        await processPayment(orderData, paymentMethod);

        // Mostrar sucesso
        showSuccessModal(orderData.orderId);

        // Limpar carrinho
        cart = [];
        saveCartToStorage();
        updateCartUI();

    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao processar pagamento. Tente novamente.', 'error');
    } finally {
        payBtn.disabled = false;
        payBtn.textContent = 'Finalizar Pagamento';
    }
});

async function processPayment(orderData, paymentMethod) {
    // Simular diferentes métodos de pagamento
    if (paymentMethod === 'pix') {
        // Simular Pix
        console.log('Gerando chave Pix...');
        await new Promise(resolve => setTimeout(resolve, 800));
    } else if (paymentMethod === 'credit' || paymentMethod === 'debit') {
        // Simular processamento com Stripe
        const cardNumber = document.getElementById('cardNumber').value;
        const cardCvc = document.getElementById('cardCvc').value;
        
        // Validação básica
        if (cardNumber.length < 16) {
            throw new Error('Cartão inválido');
        }
        if (cardCvc.length < 3) {
            throw new Error('CVC inválido');
        }

        // Simular chamada ao Stripe
        console.log('Processando com Stripe...');
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Simular resposta positiva
    return { success: true };
}

function showSuccessModal(orderId) {
    document.getElementById('orderNumber').textContent = `Número do Pedido: #${orderId}`;
    document.getElementById('successModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    closeCheckout();
}

// ========== BUSCA E FILTROS ==========
document.getElementById('searchBtn')?.addEventListener('click', () => {
    searchProducts();
});

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    displayProducts(filteredProducts);
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        
        if (filter === 'todos') {
            filteredProducts = [...products];
        } else {
            filteredProducts = products.filter(p => p.category === filter);
        }

        displayProducts(filteredProducts);
    });
});

document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'todos') {
            btn.classList.add('active');
        }
    });
    filteredProducts = [...products];
    displayProducts(products);
});

// ========== FORMULÁRIO DE CONTATO ==========
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Mensagem enviada com sucesso!');
    e.target.reset();
});

// ========== NAVEGAÇÃO ==========
document.getElementById('shopBtn')?.addEventListener('click', () => {
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('continueShoppingBtn')?.addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    location.reload();
});

// ========== INTEGRAÇÃO DE PAGAMENTOS STRIPE ==========
// Simulação de checkout com Stripe
async function initStripe() {
    // Em produção, você usaria:
    // const stripe = Stripe('sua_chave_publica');
    // const elements = stripe.elements();
    // const cardElement = elements.create('card');
    // cardElement.mount('#card-element');
    
    console.log('Stripe integrado (simulado)');
}

// ========== UTILITÁRIOS ==========
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);

    if (hasHalf) {
        stars += '⯨';
    }

    stars += '☆'.repeat(5 - Math.ceil(rating));
    return stars;
}

function generateOrderId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(subtotal);
    return subtotal + shipping;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function displayError() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Erro ao carregar produtos. Tente novamente.</p>';
}

// ========== EVENT LISTENERS GLOBAIS ==========
function setupEventListeners() {
    // Cart toggle
    document.getElementById('cartToggle')?.addEventListener('click', toggleCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);

    // Checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);
    document.getElementById('closeCheckout')?.addEventListener('click', closeCheckout);

    // Modal overlay
    document.getElementById('modalOverlay')?.addEventListener('click', () => {
        closeCart();
        closeCheckout();
        document.getElementById('successModal').classList.remove('active');
    });

    // Scroll para seções
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Fechar checkout ao clicar fora
    document.getElementById('checkoutModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') {
            closeCheckout();
        }
    });
}

// ========== ANALYTICS BÁSICO ==========
function trackEvent(eventName, eventData = {}) {
    console.log(`Evento: ${eventName}`, eventData);
    // Aqui você integraria com Google Analytics ou outra ferramenta
    // ga('send', 'event', 'Ecommerce', eventName, JSON.stringify(eventData));
}

// Rastrear quando um produto é visualizado
document.addEventListener('scroll', () => {
    document.querySelectorAll('.product-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const productName = card.querySelector('.product-name')?.textContent;
            if (productName && !card.dataset.tracked) {
                trackEvent('product_view', { product: productName });
                card.dataset.tracked = 'true';
            }
        }
    });
});

// Rastrear checkouts
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    trackEvent('checkout_start', { 
        cart_size: cart.length,
        total: calculateTotal()
    });
});

console.log('🛒 E-commerce carregado com sucesso!');