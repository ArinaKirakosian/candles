// работа с корзиной

let cart = JSON.parse(localStorage.getItem('candleCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // если мы на странице корзины, отрисовываем её
    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
    
    // если мы на странице заказов, отрисовывает чеки
    if (document.getElementById('orders-list')) {
        renderOrdersPage();
    }
});

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    
    localStorage.setItem('candleCart', JSON.stringify(cart));
    updateCartCount();
    
    // Визуальное подтверждение на кнопке
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Добавлено!";
    btn.style.backgroundColor = "#4CAF50";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }, 1500);
}

function updateCartCount() {
    let countSpan = document.getElementById('cart-count');
    if (countSpan) {
        let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.innerText = totalCount;
    }
}

function renderCartPage() {
    const cartItemsDiv = document.getElementById('cart-items');
    const summaryDiv = document.getElementById('cart-summary');
    const totalPriceSpan = document.getElementById('total-price');

    cartItemsDiv.innerHTML = '';

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center; color:#888; font-size: 20px; padding: 40px 0;">Здесь пока пусто... Самое время выбрать свою свечу!</p>';
        summaryDiv.style.display = 'none'; // Прячем итого, если пусто
    } else {
        summaryDiv.style.display = 'block'; // Показываем итого
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span style="font-weight: 500;">${item.name}</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity} шт.</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-price">
                    <strong>${itemTotal} руб.</strong>
                    <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        totalPriceSpan.innerText = total;
    }
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('candleCart', JSON.stringify(cart));
    updateCartCount();
    renderCartPage();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('candleCart', JSON.stringify(cart));
    updateCartCount();
    renderCartPage();
}

function showCheckoutForm() {
    document.getElementById('checkout-form').style.display = 'block';
    document.getElementById('checkout-btn').style.display = 'none';
}

// оформление заказа 
function submitOrder(event) {
    event.preventDefault(); // останавливает перезагрузку

    const form = event.target;
    const name = form.querySelector('input[name="name"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    const address = form.querySelector('input[name="address"]').value;
    
    // считаем сумму
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // генерируем уникальный номер и дату
    const orderNumber = "ORD-" + Math.floor(Math.random() * 10000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU') + ' в ' + now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});

    // создаем объект заказа
    const newOrder = {
        id: orderNumber,
        date: dateStr,
        customer: name,
        phone: phone,
        address: address,
        items: [...cart], 
        total: total
    };

    // сохраняем в историю 
    let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory')) || [];
    ordersHistory.push(newOrder); 
    localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));

    // очищаем корзину
    cart = [];
    localStorage.setItem('candleCart', JSON.stringify(cart));
    updateCartCount();
    renderCartPage();

    // прячем форму
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('checkout-btn').style.display = 'block';
    form.reset();

    alert(`Успешно! Ваш заказ ${orderNumber} оформлен. Ожидайте доставку в течение 2-3 дней.`);
    
    // перенаправляем на страницу заказов
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1000);
}

// отрисовка страницы "Мои заказы"
function renderOrdersPage() {
    const ordersContainer = document.getElementById('orders-list');
    let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory')) || [];

    if (ordersHistory.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align:center; color:#888; font-size: 20px; padding: 40px 0;">У вас пока нет заказов. Самое время выбрать свечу!</p>';
        return;
    }

    ordersContainer.innerHTML = '';

    // проходимся по заказам с конца (сначала новые)
    ordersHistory.reverse().forEach(order => {
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `<li>${item.name} — ${item.quantity} шт. (${item.price * item.quantity} руб.)</li>`;
        });

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
                        <div class="order-header">
                <h3>Заказ ${order.id}</h3>
                <div>
                    <span class="order-date">${order.date}</span>
                    <button onclick="deleteSingleOrder('${order.id}')" style="background:#ff6b6b; padding: 5px 10px; font-size: 12px; margin-left: 15px;">✕</button>
                </div>
            </div>
            <div class="order-body">
                <p><strong>Получатель:</strong> ${order.customer}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Адрес:</strong> ${order.address}</p>
                <p><strong>Примерное время доставки:</strong> 2-3 рабочих дня</p>
                <hr>
                <p><strong>Состав заказа:</strong></p>
                <ul class="order-items">${itemsHtml}</ul>
                <h4 class="order-total">Итого: ${order.total} руб.</h4>
            </div>
        `;
        ordersContainer.appendChild(orderCard);
    });
}
// удаление одного заказа по его ID
function deleteSingleOrder(orderId) {
    if (confirm("Удалить этот заказ из истории?")) {
        let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory')) || [];
       
        let updatedHistory = ordersHistory.filter(order => order.id !== orderId);
        
        localStorage.setItem('ordersHistory', JSON.stringify(updatedHistory));
        
        renderOrdersPage(); 
    }
}

// --- ZERO-БЛОК: Логика подбора по настроению ---

// Данные о свечах для разных настроений
const moodData = {
    relax: {
        title: 'Свеча "Кокос"',
        desc: 'Идеально для вечерней ванны и медитации. Успокаивает и снимает стресс.',
        img: 'images/candle1.jpg', 
        name: 'Свеча Кокос',
        price: 750
    },
    energy: {
        title: 'Свеча "Апельсин"',
        desc: 'Бодрящий цитрусовый аромат. Заряжает энергией и поднимает настроение.',
        img: 'images/candle2.jpg',
        name: 'Свеча Апельсин',
        price: 800
    },
    cozy: {
        title: 'Свеча "Хвоя"',
        desc: 'Теплый, древесный аромат. Создает атмосферу уюта, как у камина.',
        img: 'images/candle4.jpg',
        name: 'Свеча Хвоя',
        price: 700
    }
};

let currentMoodItem = null; // Храним выбранный товар

// Функция выбора настроения
function selectMood(mood) {
    const data = moodData[mood];
    if (!data) return;

    // Заполняем данные в блок результата
    document.getElementById('mood-title').innerText = data.title;
    document.getElementById('mood-desc').innerText = data.desc;
    document.getElementById('mood-img').src = data.img;
    
    // Запоминаем, что именно будем добавлять в корзину
    currentMoodItem = { name: data.name, price: data.price };

    // Показываем блок с результатом
    document.getElementById('mood-result').style.display = 'inline-block';
}

// Функция добавления в корзину из Zero-блока
function addToCartFromMood() {
    if (currentMoodItem) {
        // Вызываем уже существующую функцию addToCart
        // (Она лежит в начале твоего script.js)
        addToCart(currentMoodItem.name, currentMoodItem.price);
    }
}