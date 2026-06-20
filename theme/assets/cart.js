/* ============================================================
   TACTILE LAB — CART JS
   Cart drawer, add to cart, quantity updates
   ============================================================ */

(function () {
  'use strict';

  // ── Cart Drawer ──────────────────────────────────────────────
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawerClose = document.getElementById('cart-drawer-close');
  const cartDrawerTrigger = document.getElementById('cart-drawer-trigger');

  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Auto-open cart drawer on page reload if flag is set
  if (sessionStorage.getItem('open_cart') === 'true') {
    sessionStorage.removeItem('open_cart');
    setTimeout(() => {
      openCartDrawer();
    }, 400);
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (cartDrawerTrigger) {
    cartDrawerTrigger.addEventListener('click', openCartDrawer);
  }
  if (cartDrawerClose) {
    cartDrawerClose.addEventListener('click', closeCartDrawer);
  }
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', closeCartDrawer);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });

  // ── Update Cart Count UI ─────────────────────────────────────
  function updateCartCount(count) {
    document.querySelectorAll('#header-cart-count, #cart-count').forEach(el => {
      el.textContent = count;
    });
  }

  // ── Fetch Cart and Re-render Drawer ─────────────────────────
  async function refreshCartDrawer() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      updateCartCount(cart.item_count);

      // Update subtotal
      const subtotal = document.getElementById('cart-subtotal');
      if (subtotal) {
        subtotal.textContent = formatMoney(cart.total_price);
      }

      // Update items list
      const itemsContainer = document.getElementById('cart-drawer-items');
      const footer = document.getElementById('cart-drawer-footer');

      if (itemsContainer) {
        if (cart.items.length > 0) {
          itemsContainer.innerHTML = cart.items.map(item => {
            let propertiesHtml = '';
            if (item.properties) {
              for (const [key, value] of Object.entries(item.properties)) {
                if (value) {
                  propertiesHtml += `
                    <p class="cart-item__property">
                      <span>${key}:</span>
                      ${value}
                    </p>
                  `;
                }
              }
            }

            const variantHtml = item.variant_title && item.variant_title !== 'Default Title'
              ? `<p class="cart-item__variant">${item.variant_title}</p>`
              : '';

            const imageHtml = item.image
              ? `<div class="cart-item__image-wrapper">
                   <img src="${item.image}" alt="${item.title}" class="cart-item__image" width="120" height="120">
                 </div>`
              : '<div class="cart-item__image-wrapper"></div>';

            return `
              <div class="cart-item" data-key="${item.key}">
                ${imageHtml}
                <div class="cart-item__info">
                  <p class="cart-item__vendor">${item.vendor || ''}</p>
                  <h4 class="cart-item__title">${item.product_title}</h4>
                  ${variantHtml}
                  ${propertiesHtml}
                  
                  <div class="cart-item__footer">
                    <div class="cart-item__quantity">
                      <button class="cart-item__qty-btn" data-action="decrease" data-key="${item.key}">−</button>
                      <span class="cart-item__qty-value">${item.quantity}</span>
                      <button class="cart-item__qty-btn" data-action="increase" data-key="${item.key}">+</button>
                    </div>
                    <span class="cart-item__price">${formatMoney(item.final_line_price)}</span>
                  </div>
                </div>
                
                <button class="cart-item__remove" data-key="${item.key}" aria-label="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            `;
          }).join('');

          if (footer) {
            footer.style.display = 'flex';
          }
        } else {
          itemsContainer.innerHTML = `
            <div class="cart-drawer__empty">
              <p>Your cart is empty.</p>
              <a href="/collections/all" class="btn btn--primary">
                Continue Shopping
              </a>
            </div>
          `;
          if (footer) {
            footer.style.display = 'none';
          }
        }
      }

      return cart;
    } catch (err) {
      console.error('Failed to refresh cart:', err);
    }
  }

  // ── Format Money (Shopify cents to dollars) ──────────────────
  function formatMoney(cents) {
    return '₱' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ── Add to Cart ──────────────────────────────────────────────
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      const variantId = parseInt(addToCartBtn.dataset.variantId);
      const qty = parseInt(document.getElementById('qty-input')?.value || '1');

      // Collect configurator properties if present
      const properties = {};
      const summaryBase = document.getElementById('summary-base');
      const summarySwitches = document.getElementById('summary-switches');
      const summaryKeycaps = document.getElementById('summary-keycaps');

      if (summaryBase && summaryBase.textContent !== '—') {
        properties['Base'] = summaryBase.textContent;
        properties['Switches'] = summarySwitches?.textContent || '';
        properties['Keycaps'] = summaryKeycaps?.textContent || '';
      }

      // Update button state
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Adding...';

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: variantId,
            quantity: qty,
            properties: Object.keys(properties).length ? properties : undefined,
          }),
        });

        if (!res.ok) throw new Error('Failed to add to cart');

        await refreshCartDrawer();
        openCartDrawer();

        if (window.showToast) {
          window.showToast('Added to cart!');
        }
      } catch (err) {
        console.error('Add to cart error:', err);
        if (window.showToast) {
          window.showToast('Failed to add item', 'error');
        }
      } finally {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
      }
    });
  }

  // ── Quick Add (from product cards) ──────────────────────────
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.product-card__quick-add');
    if (!btn) return;

    const variantId = parseInt(btn.dataset.variantId);
    if (!variantId) return;

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Adding...';

    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });

      await refreshCartDrawer();
      openCartDrawer();

      if (window.showToast) window.showToast('Added to cart!');
    } catch (err) {
      if (window.showToast) window.showToast('Failed to add item', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // ── Cart Item Quantity Update ────────────────────────────────
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.cart-item__qty-btn');
    if (!btn) return;

    const key = btn.dataset.key;
    const action = btn.dataset.action;
    const valueEl = btn.parentElement.querySelector('.cart-item__qty-value');
    const currentQty = parseInt(valueEl?.textContent || '1');
    const newQty = action === 'increase' ? currentQty + 1 : Math.max(0, currentQty - 1);

    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty }),
      });

      if (newQty === 0) {
        btn.closest('.cart-item')?.remove();
      } else if (valueEl) {
        valueEl.textContent = newQty;
      }

      await refreshCartDrawer();
    } catch (err) {
      console.error('Quantity update failed:', err);
    }
  });

  // ── Cart Item Remove ─────────────────────────────────────────
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.cart-item__remove, .cart-table__remove');
    if (!btn) return;

    const key = btn.dataset.key;
    if (!key) return;

    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 }),
      });

      btn.closest('.cart-item, .cart-table__row')?.remove();
      await refreshCartDrawer();

      if (window.showToast) window.showToast('Item removed');
    } catch (err) {
      console.error('Remove item failed:', err);
    }
  });

  // ── Cart Page Quantity Inputs ────────────────────────────────
  document.querySelectorAll('.cart-table__row .quantity-selector__btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      const action = btn.dataset.action;
      const input = btn.closest('.quantity-selector')
        .querySelector('.quantity-selector__input');
      const currentQty = parseInt(input.value);
      const newQty = action === 'increase' ? currentQty + 1 : Math.max(0, currentQty - 1);

      input.value = newQty;

      try {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: newQty }),
        });

        await refreshCartDrawer();

        // Update line total
        const row = btn.closest('.cart-table__row');
        if (row) {
          const res = await fetch('/cart.js');
          const cart = await res.json();
          const item = cart.items.find(i => i.key === key);
          const totalEl = row.querySelector('.cart-table__total');
          if (totalEl && item) {
            totalEl.textContent = formatMoney(item.final_line_price);
          }
          // Update page subtotal
          const pageSubtotal = document.getElementById('cart-page-subtotal');
          if (pageSubtotal) {
            pageSubtotal.textContent = formatMoney(cart.total_price);
          }
        }
      } catch (err) {
        console.error('Cart page quantity update failed:', err);
      }
    });
  });

})();