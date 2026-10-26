// As opções do catálogo mudaram: índices antigos não representam os mesmos
// tamanhos/quantidades. Uma nova versão evita reinterpretar pedidos anteriores.
// A chave v1 é apenas consultada para o aviso; seu conteúdo permanece intacto.
const STORAGE_KEY = 'delicia-cart-v2';
const LEGACY_STORAGE_KEY = 'delicia-cart-v1';
const MAX_QUANTITY = 99;
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Inicializa a sacola sem depender de frameworks ou de serviços externos. */
export function initCart(products) {
  const catalog = new Map(products.map((product) => [product.id, product]));
  const dialog = document.querySelector('#cart-dialog');
  const openButton = document.querySelector('#cart-open');
  const closeButton = document.querySelector('#cart-close');
  const itemsElement = document.querySelector('#cart-items');
  const emptyElement = document.querySelector('#cart-empty');
  const summaryElement = document.querySelector('#cart-summary');
  const totalElement = document.querySelector('#cart-total');
  const countElement = document.querySelector('#cart-count');
  const checkoutButton = document.querySelector('#checkout-button');
  const checkoutResult = document.querySelector('#checkout-result');
  const orderText = document.querySelector('#order-text');
  const checkoutStatus = document.querySelector('#checkout-status');
  const instagramLink = document.querySelector('#instagram-link');
  let legacyNeedsReselect = false;
  let lines = restore();
  const catalogNotice = element(
    'p',
    'cart-catalog-notice',
    'Atualizamos as opções e os preços do cardápio. Sua sacola anterior não foi reaproveitada para evitar trocar tamanhos ou quantidades. Escolha novamente seus produtos no cardápio.',
  );
  catalogNotice.id = 'cart-catalog-notice';
  catalogNotice.setAttribute('role', 'status');
  emptyElement.before(catalogNotice);
  let revision = 0;
  let copying = false;
  let previousFocus;

  checkoutStatus.setAttribute('role', 'status');
  checkoutStatus.setAttribute('aria-live', 'polite');
  orderText.readOnly = true;
  instagramLink.href = 'https://www.instagram.com/deliciadeboloss/';
  instagramLink.target = '_blank';
  instagramLink.rel = 'noopener noreferrer';

  function validLine(line) {
    if (!line || typeof line !== 'object') return false;
    const product = catalog.get(line.productId);
    return Boolean(
      product &&
        Number.isInteger(line.variantIndex) &&
        line.variantIndex >= 0 &&
        product.variants[line.variantIndex] &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0,
    );
  }

  function restore() {
    try {
      const savedValue = localStorage.getItem(STORAGE_KEY);
      if (savedValue === null) {
        try {
          const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '[]');
          legacyNeedsReselect = Array.isArray(legacy) && legacy.length > 0;
        } catch {
          // Dados antigos corrompidos não são importados nem sobrescritos.
        }
        return [];
      }
      const saved = JSON.parse(savedValue);
      if (!Array.isArray(saved)) return [];
      const restored = [];
      for (const line of saved) {
        if (!validLine(line)) continue;
        const existing = restored.find(
          (item) => item.productId === line.productId && item.variantIndex === line.variantIndex,
        );
        if (existing) {
          existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + line.quantity);
        } else {
          restored.push({
            productId: line.productId,
            variantIndex: line.variantIndex,
            quantity: Math.min(MAX_QUANTITY, line.quantity),
          });
        }
      }
      return restored;
    } catch {
      // A navegação privada ou dados antigos não impedem usar a sacola nesta visita.
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // A sacola continua funcionando em memória quando o armazenamento está indisponível.
    }
  }

  function subtotal(line) {
    return catalog.get(line.productId).variants[line.variantIndex].price * line.quantity;
  }

  function total() {
    return lines.reduce((sum, line) => sum + subtotal(line), 0);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function quantityButton(label, text, handler, disabled = false) {
    const button = element('button', '', text);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.disabled = disabled;
    button.addEventListener('click', handler);
    return button;
  }

  function changeQuantity(line, difference) {
    const position = lines.indexOf(line);
    line.quantity = Math.min(MAX_QUANTITY, line.quantity + difference);
    if (line.quantity <= 0) lines = lines.filter((item) => item !== line);
    changed();
    const nextItem = itemsElement.children[Math.min(position, lines.length - 1)];
    const buttons = nextItem?.querySelectorAll('.quantity-control button');
    const target = buttons?.[difference > 0 ? 1 : 0];
    (target && !target.disabled ? target : buttons?.[0] || closeButton).focus();
  }

  function render() {
    const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    countElement.textContent = String(quantity);
    openButton.setAttribute(
      'aria-label',
      `Abrir sacola, ${quantity} ${quantity === 1 ? 'item' : 'itens'}`,
    );
    catalogNotice.hidden = !legacyNeedsReselect;
    emptyElement.hidden = lines.length > 0 || legacyNeedsReselect;
    summaryElement.hidden = lines.length === 0;
    checkoutButton.disabled = lines.length === 0 || copying;
    totalElement.textContent = currency.format(total() / 100);
    itemsElement.replaceChildren();

    lines.forEach((line) => {
      const product = catalog.get(line.productId);
      const variant = product.variants[line.variantIndex];
      const item = element('article', 'cart-item');
      const image = element(product.photoPosition ? 'div' : 'img', 'cart-item__image');
      if (product.photoPosition) {
        image.setAttribute('role', 'img');
        image.setAttribute('aria-label', product.alt || product.name);
        image.style.backgroundImage = `url("${product.image}")`;
        image.style.backgroundSize = '300% 200%';
        image.style.backgroundPosition = product.photoPosition;
      } else {
        image.src = product.image;
        image.alt = product.alt || product.name;
        image.width = 80;
        image.height = 96;
      }
      const info = element('div', 'cart-item__info');
      info.append(
        element('h3', 'cart-item__name', product.name),
        element('p', 'cart-item__variant', variant.label),
        element('p', 'cart-item__price', currency.format(subtotal(line) / 100)),
      );
      const controls = element('div', 'quantity-control');
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', `Quantidade de ${product.name}, ${variant.label}`);
      const amount = element('span', '', String(line.quantity));
      amount.setAttribute('aria-label', `${line.quantity} unidades`);
      controls.append(
        quantityButton(`Diminuir quantidade de ${product.name}`, '−', () => {
          changeQuantity(line, -1);
        }),
        amount,
        quantityButton(
          `Aumentar quantidade de ${product.name}`,
          '+',
          () => changeQuantity(line, 1),
          line.quantity >= MAX_QUANTITY,
        ),
      );
      const remove = element('button', 'remove-item', 'Remover');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remover ${product.name}, ${variant.label}`);
      remove.addEventListener('click', () => {
        const position = lines.indexOf(line);
        lines = lines.filter((entry) => entry !== line);
        changed();
        const nextItem = itemsElement.children[Math.min(position, lines.length - 1)];
        (nextItem?.querySelector('.remove-item') || closeButton).focus();
      });
      info.append(controls, remove);
      item.append(image, info);
      itemsElement.append(item);
    });
  }

  function changed() {
    revision += 1;
    legacyNeedsReselect = false;
    checkoutResult.hidden = true;
    orderText.value = '';
    checkoutStatus.textContent = '';
    persist();
    render();
  }

  function add(productId, variantIndex = 0, quantity = 1) {
    const candidate = { productId, variantIndex, quantity };
    if (!validLine(candidate)) return false;
    const existing = lines.find(
      (line) => line.productId === productId && line.variantIndex === variantIndex,
    );
    if (existing?.quantity === MAX_QUANTITY) return false;
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
    } else {
      lines.push({ ...candidate, quantity: Math.min(MAX_QUANTITY, quantity) });
    }
    changed();
    return true;
  }

  function open() {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('cart-is-open');
    closeButton.focus();
  }

  function orderSummary() {
    const items = lines.map((line) => {
      const product = catalog.get(line.productId);
      const variant = product.variants[line.variantIndex];
      return `• ${line.quantity} × ${product.name}\n  ${variant.label} — ${currency.format(subtotal(line) / 100)}`;
    });
    return [
      'Olá, Delícia de Bolos! 🍰',
      'Gostaria de encomendar:',
      '',
      ...items,
      '',
      `Total estimado: ${currency.format(total() / 100)}`,
      '',
      'Podem confirmar os valores, a disponibilidade e combinar a data e a entrega/retirada?',
    ].join('\n');
  }

  /**
   * Copia o resumo a partir de um clique explícito do cliente. A Clipboard API
   * exige HTTPS (ou localhost) e pode ser recusada pelas permissões do navegador.
   * Só mostramos a confirmação de cópia quando uma API informa sucesso.
   * O Instagram não recebe texto automaticamente: o cliente abre o perfil e
   * cola o resumo na conversa para combinar os detalhes com a confeitaria.
   */
  async function copyOrder() {
    if (!lines.length || copying) return;
    copying = true;
    checkoutButton.disabled = true;
    const currentRevision = revision;
    const summary = orderSummary();
    let copied = false;
    checkoutStatus.textContent = 'Preparando seu pedido…';

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        copied = true;
      }
    } catch {
      // Uma recusa de permissão leva à alternativa abaixo, sem perder o pedido.
    }

    if (revision !== currentRevision) {
      copying = false;
      checkoutButton.disabled = lines.length === 0;
      checkoutStatus.textContent = 'A sacola mudou. Copie novamente para enviar o pedido atualizado.';
      return;
    }

    checkoutResult.hidden = false;
    orderText.value = summary;

    if (!copied) {
      // Alternativa para navegadores sem Clipboard API: seleciona o texto e
      // tenta o comando legado. Se falhar, o resumo fica selecionável à mão.
      orderText.focus();
      orderText.select();
      try {
        copied = Boolean(document.execCommand?.('copy'));
      } catch {
        copied = false;
      }
    }

    checkoutStatus.textContent = copied
      ? 'Pedido copiado! Abra o Instagram e cole o resumo na conversa com @deliciadeboloss.'
      : 'Não foi possível copiar automaticamente. Selecione e copie o resumo abaixo; depois, abra o Instagram e cole na conversa.';
    copying = false;
    checkoutButton.disabled = lines.length === 0;
    if (copied) instagramLink.focus();
  }

  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', () => dialog.close());
  checkoutButton.addEventListener('click', copyOrder);
  dialog.addEventListener('close', () => {
    document.body.classList.remove('cart-is-open');
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      dialog.close();
    }
  });

  render();
  return { add, open };
}
