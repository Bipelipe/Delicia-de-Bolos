"""Testes funcionais do cardápio: execute com o servidor de desenvolvimento ativo."""

import json
import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get('DELICIA_BASE_URL', 'http://127.0.0.1:8000/')
STORAGE_KEY = 'delicia-cart-v2'
LEGACY_KEY = 'delicia-cart-v1'

# Valores fornecidos pela loja; independentes dos dados usados pela aplicação.
CAKE_OPTIONS = [
    ('1 kg · 10 fatias', 'R$ 90,00'),
    ('1,5 kg · 15 fatias', 'R$ 135,00'),
    ('2 kg · 20 fatias', 'R$ 180,00'),
    ('2,5 kg · 25 fatias', 'R$ 225,00'),
]
EXPECTED_CATALOG = [
    ('bolo-morango', CAKE_OPTIONS),
    ('bolo-chocolate', CAKE_OPTIONS),
    ('brigadeiros', [('Cento · 100 unidades', 'R$ 120,00')]),
    ('beijinhos', [('Cento · 100 unidades', 'R$ 120,00')]),
    ('cupcake-baunilha', [('Baunilha · unidade', 'R$ 6,00')]),
    ('cupcake-chocolate', [('Chocolate · unidade', 'R$ 6,00')]),
]

checks = []


def check(name, condition=True):
    assert condition, name
    checks.append(name)
    print('PASS', name)


def text(locator):
    return locator.inner_text().replace('\xa0', ' ')


def storage(page, key):
    return page.evaluate('(key) => localStorage.getItem(key)', key)


def product_card(page, product_id):
    return page.locator('.product-card').filter(has=page.locator(f'#variant-{product_id}'))


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
        headless=True,
        args=['--no-sandbox'],
    )
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    context.add_init_script("""
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {writeText: async text => {window.__copied = text}},
        });
    """)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.on('response', lambda response: errors.append(f'{response.status} {response.url}') if response.status >= 400 else None)
    page.goto(BASE_URL, wait_until='networkidle')
    page.screenshot(path='/tmp/delicia-desktop.png', full_page=True)

    cards = page.locator('.product-card:visible')
    check('six catalog products', cards.count() == 6)
    for category in ['bolos', 'docinhos', 'cupcakes']:
        page.locator(f'button[data-category={category}]').click()
        check('filter ' + category, cards.count() == 2)
    page.locator('button[data-category=todos]').click()
    check('all filter reset', cards.count() == 6)

    for product_id, options in EXPECTED_CATALOG:
        card = product_card(page, product_id)
        select = card.locator('select')
        check(f'{product_id} exact official options', select.locator('option').all_text_contents() == [label for label, _ in options])
        for index, (label, price) in enumerate(options):
            select.select_option(str(index))
            check(f'{product_id} price for {label}', text(card.locator('.product-price strong')) == price)
        select.select_option('0')

    card = product_card(page, 'bolo-morango')
    card.locator('select').select_option('1')
    check('variant updates price', text(card.locator('.product-price strong')) == 'R$ 135,00')
    card.locator('.quantity-plus').click()
    check('card quantity increment', card.locator('input').input_value() == '2')
    card.locator('button[type=submit]').click()
    check('added two units', page.locator('#cart-count').inner_text() == '2')
    card.locator('button[type=submit]').click()
    check('cart same variant merges', len(json.loads(storage(page, STORAGE_KEY))) == 1)
    card.locator('select').select_option('0')
    card.locator('input').fill('1')
    card.locator('button[type=submit]').click()
    page.locator('#cart-open').click()
    check('distinct variant separate', page.locator('.cart-item').count() == 2)
    check('cart total exact', text(page.locator('#cart-total')) == 'R$ 630,00')
    page.locator('.cart-item').nth(0).locator('.quantity-control button').nth(1).click()
    check('cart increment total', text(page.locator('#cart-total')) == 'R$ 765,00')
    page.locator('.cart-item').nth(0).locator('.quantity-control button').nth(0).click()
    check('cart decrement total', text(page.locator('#cart-total')) == 'R$ 630,00')
    page.locator('#checkout-button').click()
    expect(page.locator('#checkout-result')).to_be_visible()
    check('clipboard success', page.locator('#checkout-status').inner_text().startswith('Pedido copiado!'))
    copied = page.evaluate('window.__copied').replace('\xa0', ' ')
    check('summary quantities options total', '4 × Um amor de morango' in copied and '1,5 kg · 15 fatias' in copied and '1 × Um amor de morango' in copied and 'Total estimado: R$ 630,00' in copied)
    check('instagram URL and new tab', page.locator('#instagram-link').get_attribute('href') == 'https://www.instagram.com/deliciadeboloss/' and page.locator('#instagram-link').get_attribute('target') == '_blank')
    page.locator('.cart-item').nth(0).locator('.quantity-control button').nth(1).click()
    check('edit invalidates copied summary', page.locator('#checkout-result').is_hidden() and page.locator('#order-text').input_value() == '')
    page.keyboard.press('Escape')
    check('escape closes and restores trigger focus', not page.locator('#cart-dialog').evaluate('(element) => element.open') and page.locator('#cart-open').evaluate('(element) => element === document.activeElement'))
    page.reload(wait_until='networkidle')
    page.locator('#cart-open').click()
    check('cart survives reload', page.locator('.cart-item').count() == 2 and text(page.locator('#cart-total')) == 'R$ 765,00')
    page.evaluate("""
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {writeText: async () => {throw Error('blocked')}},
        });
        document.execCommand = () => false;
    """)
    page.locator('#checkout-button').click()
    check('clipboard denied shows manual copy', 'Não foi possível copiar automaticamente' in page.locator('#checkout-status').inner_text() and page.locator('#order-text').is_visible() and '765,00' in page.locator('#order-text').input_value())
    page.locator('.cart-item .remove-item').first.click()
    check('remove item recalculates', page.locator('.cart-item').count() == 1 and text(page.locator('#cart-total')) == 'R$ 90,00')
    page.locator('.cart-item .quantity-control button').nth(0).click()
    check('decrement to zero shows empty', page.locator('.cart-item').count() == 0 and page.locator('#cart-empty').is_visible() and page.locator('#checkout-button').is_disabled() and page.locator('#cart-count').inner_text() == '0')
    page.keyboard.press('Escape')
    page.evaluate('(key) => localStorage.setItem(key, "bad json")', STORAGE_KEY)
    page.reload(wait_until='networkidle')
    check('corrupt storage tolerated', page.locator('#cart-count').inner_text() == '0' and page.locator('.product-card').count() == 6)

    # Cesta independente com os três tipos de venda: bolo, cento e unidade.
    page.evaluate('(key) => localStorage.removeItem(key)', STORAGE_KEY)
    page.reload(wait_until='networkidle')
    mixed_basket = [
        ('bolo-morango', '1', 1),
        ('bolo-chocolate', '3', 1),
        ('brigadeiros', '0', 2),
        ('beijinhos', '0', 1),
        ('cupcake-baunilha', '0', 6),
        ('cupcake-chocolate', '0', 12),
    ]
    for product_id, option, quantity in mixed_basket:
        card = product_card(page, product_id)
        card.locator('select').select_option(option)
        card.locator('input').fill(str(quantity))
        card.locator('button[type=submit]').click()
    page.locator('#cart-open').click()
    check('mixed basket has all six products', page.locator('.cart-item').count() == 6)
    check('mixed official basket total', text(page.locator('#cart-total')) == 'R$ 828,00')
    unit_prices = [text(price) for price in page.locator('.cart-item__price').all()]
    check('cento and cupcake quantity multiplication', unit_prices == ['R$ 135,00', 'R$ 225,00', 'R$ 240,00', 'R$ 120,00', 'R$ 36,00', 'R$ 72,00'])
    page.locator('#checkout-button').click()
    copied = page.evaluate('window.__copied').replace('\xa0', ' ')
    expected_summary_parts = [
        '1 × Um amor de morango\n  1,5 kg · 15 fatias — R$ 135,00',
        '1 × Chocolate & mais chocolate\n  2,5 kg · 25 fatias — R$ 225,00',
        '2 × Brigadeiro de coração\n  Cento · 100 unidades — R$ 240,00',
        '1 × Um beijinho de coco\n  Cento · 100 unidades — R$ 120,00',
        '6 × Pequenos encantos\n  Baunilha · unidade — R$ 36,00',
        '12 × Só mais um, vai?\n  Chocolate · unidade — R$ 72,00',
        'Total estimado: R$ 828,00',
    ]
    check('mixed checkout preserves weights centos units and total', all(part in copied for part in expected_summary_parts))
    page.reload(wait_until='networkidle')
    page.locator('#cart-open').click()
    check('mixed basket persists with current options', page.locator('.cart-item').count() == 6 and text(page.locator('#cart-total')) == 'R$ 828,00' and 'Baunilha · unidade' in page.locator('#cart-items').inner_text())
    page.keyboard.press('Escape')

    # Índices do catálogo antigo não podem virar silenciosamente novos tamanhos.
    legacy = json.dumps([
        {'productId': 'bolo-morango', 'variantIndex': 2, 'quantity': 1},
        {'productId': 'cupcake-baunilha', 'variantIndex': 1, 'quantity': 3},
    ])
    page.evaluate('([currentKey, oldKey, legacy]) => {localStorage.removeItem(currentKey); localStorage.setItem(oldKey, legacy)}', [STORAGE_KEY, LEGACY_KEY, legacy])
    page.reload(wait_until='networkidle')
    page.locator('#cart-open').click()
    check('legacy cart is not silently restored', page.locator('.cart-item').count() == 0 and page.locator('#cart-count').inner_text() == '0')
    check('legacy cart explains catalog change', page.locator('#cart-catalog-notice').is_visible() and 'Sua sacola anterior não foi reaproveitada' in page.locator('#cart-catalog-notice').inner_text())
    check('legacy cart preserved before new selection', storage(page, LEGACY_KEY) == legacy and storage(page, STORAGE_KEY) is None)
    page.keyboard.press('Escape')
    card = product_card(page, 'cupcake-baunilha')
    card.locator('input').fill('3')
    card.locator('button[type=submit]').click()
    page.locator('#cart-open').click()
    check('new unit order uses current price', text(page.locator('#cart-total')) == 'R$ 18,00' and 'Baunilha · unidade' in page.locator('#cart-items').inner_text())
    check('new cart does not overwrite legacy storage', storage(page, LEGACY_KEY) == legacy and json.loads(storage(page, STORAGE_KEY)) == [{'productId': 'cupcake-baunilha', 'variantIndex': 0, 'quantity': 3}])
    page.reload(wait_until='networkidle')
    page.locator('#cart-open').click()
    check('current cart takes precedence over preserved legacy', page.locator('.cart-item').count() == 1 and text(page.locator('#cart-total')) == 'R$ 18,00' and page.locator('#cart-catalog-notice').is_hidden())
    page.keyboard.press('Escape')
    page.evaluate('([currentKey, oldKey]) => {localStorage.removeItem(currentKey); localStorage.removeItem(oldKey)}', [STORAGE_KEY, LEGACY_KEY])
    page.reload(wait_until='networkidle')

    image_ok = page.evaluate("""async () => {
        const urls = ['assets/hero-cake.png', 'assets/products-sheet.png'];
        return await Promise.all(urls.map(url => new Promise(resolve => {
            const image = new Image();
            image.onload = () => resolve(image.naturalWidth > 0);
            image.onerror = () => resolve(false);
            image.src = url;
        })));
    }""")
    check('hero and product images load', all(image_ok))
    check('desktop no overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    for width in [390, 320]:
        page.set_viewport_size({'width': width, 'height': 844})
        page.goto(BASE_URL, wait_until='networkidle')
        check(f'{width}px no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        if width == 390:
            page.screenshot(path='/tmp/delicia-mobile.png', full_page=True)
        page.locator('.product-card').first.locator('button[type=submit]').click()
        page.locator('#cart-open').click()
        check(f'{width}px drawer fits', page.locator('#cart-dialog').bounding_box()['width'] <= width)
        page.locator('#checkout-button').click()
        check(f'{width}px checkout usable', page.locator('#checkout-result').is_visible())
        page.locator('#cart-close').click()
    check('no browser errors', not errors)
    print(json.dumps({'passed': len(checks), 'errors': errors, 'screenshots': ['/tmp/delicia-desktop.png', '/tmp/delicia-mobile.png']}, ensure_ascii=False))
    browser.close()
