import { products } from './products.js';
import { initCart } from './cart.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const cart = initCart(products);
const grid = document.querySelector('#product-grid');
const toast = document.querySelector('#toast');
let toastTimeout;

function notify(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3500);
}

function productCard(product) {
  // O HTML usa somente o catálogo local, sem interpolar conteúdo do usuário.
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.category = product.category;
  card.innerHTML = `
    <div class="product-photo" role="img" aria-label="${product.alt}" style="background-image:url('${product.image}');background-position:${product.photoPosition}">
      ${product.badge ? `<span class="product-badge product-badge--${product.badgeType}">${product.badgeType === 'rose' ? '♡ ' : ''}${product.badge}</span>` : ''}
    </div>
    <div class="product-info">
      <span class="product-category">${product.categoryLabel}</span>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <form class="product-form">
        <label class="option-label" for="variant-${product.id}">Escolha sua opção</label>
        <div class="select-wrap"><select id="variant-${product.id}" name="variant" aria-label="Opção de ${product.name}">${product.variants.map((variant, index) => `<option value="${index}">${variant.label}</option>`).join('')}</select></div>
        <div class="product-bottom"><div class="product-price"><span>feito para você</span><strong>${money.format(product.variants[0].price / 100)}</strong></div>
          <div class="quantity-control product-quantity" role="group" aria-label="Quantidade de ${product.name}">
            <button type="button" class="quantity-minus" aria-label="Diminuir quantidade de ${product.name}" disabled>−</button>
            <input type="number" name="quantity" aria-label="Quantidade de ${product.name}" min="1" max="99" step="1" value="1" required inputmode="numeric">
            <button type="button" class="quantity-plus" aria-label="Aumentar quantidade de ${product.name}">+</button>
          </div>
        </div>
        <button class="add-button" type="submit"><svg class="icon" aria-hidden="true"><use href="#icon-bag"/></svg>Adicionar à Sacola<span aria-hidden="true">+</span></button>
      </form>
    </div>`;

  const select = card.querySelector('select');
  const quantity = card.querySelector('input');
  const minus = card.querySelector('.quantity-minus');
  const plus = card.querySelector('.quantity-plus');
  const updateControls = () => {
    minus.disabled = Number(quantity.value) <= 1;
    plus.disabled = Number(quantity.value) >= 99;
  };
  select.addEventListener('change', () => {
    card.querySelector('.product-price strong').textContent = money.format(product.variants[Number(select.value)].price / 100);
  });
  quantity.addEventListener('input', updateControls);
  quantity.addEventListener('change', () => {
    quantity.value = String(Math.max(1, Math.min(99, Math.floor(Number(quantity.value) || 1))));
    updateControls();
  });
  [minus, plus].forEach((button, index) => button.addEventListener('click', () => {
    quantity.value = String(Math.max(1, Math.min(99, (Number(quantity.value) || 1) + (index ? 1 : -1))));
    updateControls();
  }));
  card.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quantity.checkValidity()) return quantity.reportValidity();
    const added = cart.add(product.id, Number(select.value), Number(quantity.value));
    notify(added ? `${product.name} na sacola. Uma ótima escolha!` : 'Você já tem o limite de 99 unidades desta opção na sacola.');
  });
  return card;
}

products.forEach((product) => grid.append(productCard(product)));
document.querySelectorAll('[data-category].filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    document.querySelectorAll('.filter-button').forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    grid.querySelectorAll('.product-card').forEach((card) => {
      card.hidden = category !== 'todos' && card.dataset.category !== category;
      if (!card.hidden) visible += 1;
    });
    document.querySelector('#filter-status').textContent = `${visible} produtos exibidos: ${button.textContent.trim()}.`;
  });
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());
