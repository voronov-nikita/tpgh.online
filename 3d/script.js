// ====== Глобальные переменные ======
let products = [];
let categories = [];
let currentFilter = 'all';

// ====== DOM-элементы ======
const cardsGrid = document.getElementById('cardsGrid');
const filtersContainer = document.getElementById('filters');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const authorNameEl = document.getElementById('authorName');

// ====== Загрузка данных из JSON ======
async function loadData() {
    try {
        const response = await fetch('cards.json');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();

        products = data.products || [];
        categories = data.categories || [{ key: 'all', label: 'Все' }];

        if (data.author && authorNameEl) {
            authorNameEl.textContent = data.author;
        }

        renderFilters();
        renderCards();
    } catch (error) {
        console.error('Не удалось загрузить данные:', error);
        cardsGrid.innerHTML = `<div class="error-message">
            Не удалось загрузить карточки. Попробуйте позже<br>
            <small>${error.message}</small>
        </div>`;
    }
}

// ====== Отрисовка фильтров ======
function renderFilters() {
    filtersContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat.key === currentFilter ? 'active' : ''}"
                data-category="${cat.key}">
            ${cat.label}
        </button>
    `).join('');
}

// ====== Вспомогательные функции ======
function getCategoryName(categoryKey) {
    const found = categories.find(c => c.key === categoryKey);
    return found ? found.label : categoryKey;
}

// ====== Создание HTML карточки ======
function createCardHTML(product) {
    const mainImageHTML = product.mainImage
        ? `<span style="font-size:3rem;">${product.mainImage}</span>`
        : `<div class="img-placeholder">🖼️</div>`;

    return `
        <div class="card" data-id="${product.id}">
            <div class="card-img">${mainImageHTML}</div>
            <div class="card-content">
                <div class="card-title">${product.title}</div>
                <div class="card-price">${product.price}</div>
                <div class="card-desc-short">${product.shortDesc}</div>
                <span class="card-tag">${getCategoryName(product.category)}</span>
            </div>
        </div>
    `;
}

// ====== Отрисовка карточек с фильтром ======
function renderCards() {
    const filtered = currentFilter === 'all'
        ? products
        : products.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        cardsGrid.innerHTML = '<div class="loading">Нет данных</div>';
        return;
    }

    cardsGrid.innerHTML = filtered.map(createCardHTML).join('');
}

// ====== Модальное окно ======
function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const galleryHTML = (product.images || []).map(img => `
        <div class="modal-gallery-item">
            <span style="font-size:2.5rem;">${img}</span>
        </div>
    `).join('');

    modalContent.innerHTML = `
        <h2>${product.title}</h2>
        <div class="modal-price">${product.price}</div>
        <div class="modal-description">${product.fullDesc}</div>
        <div class="modal-gallery">${galleryHTML}</div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ====== Обработчики событий ======
cardsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        const id = parseInt(card.dataset.id, 10);
        openModal(id);
    }
});

filtersContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.category;
    renderCards();
});

modalCloseBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ====== Запуск ======
loadData();