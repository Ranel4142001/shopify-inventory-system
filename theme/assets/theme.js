/* ============================================================
   TACTILE LAB — THEME JS
   Core interactions: header, mobile menu, gallery, variants
   ============================================================ */

(function () {
  'use strict';

  // ── Mobile Menu ─────────────────────────────────────────────
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNav.style.display === 'block';
      mobileNav.style.display = isOpen ? 'none' : 'block';
      mobileNav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  // ── Sticky Header Shadow ─────────────────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,0.4)'
        : 'none';
    }, { passive: true });
  }

  // ── Product Gallery Thumbnails ───────────────────────────────
  const thumbs = document.querySelectorAll('.product-gallery__thumb');
  const mainImage = document.getElementById('product-main-image');

  if (thumbs.length && mainImage) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        // Update main image
        mainImage.style.opacity = '0';
        setTimeout(() => {
          mainImage.src = thumb.dataset.imageUrl;
          mainImage.alt = thumb.dataset.imageAlt || '';
          mainImage.style.opacity = '1';
        }, 150);

        // Update active state
        thumbs.forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });
  }

  // ── Variant Selector ─────────────────────────────────────────
  const variantBtns = document.querySelectorAll('.variant-btn');

  if (variantBtns.length && window.productData) {
    variantBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const optionIndex = parseInt(btn.dataset.optionIndex);
        const value = btn.dataset.value;

        // Update active state within same option group
        document
          .querySelectorAll(`.variant-btn[data-option-index="${optionIndex}"]`)
          .forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        // Find matching variant
        const selectedValues = [];
        document.querySelectorAll('.variant-btn.is-selected').forEach(b => {
          selectedValues[parseInt(b.dataset.optionIndex)] = b.dataset.value;
        });

        const matched = window.productData.variants.find(v => {
          return selectedValues.every((val, i) => {
            const optKey = `option${i + 1}`;
            return v[optKey] === val;
          });
        });

        if (matched) {
          window.selectedVariant = matched;
          const addBtn = document.getElementById('add-to-cart-btn');
          if (addBtn) {
            addBtn.dataset.variantId = matched.id;
            addBtn.disabled = !matched.available;
            addBtn.textContent = matched.available
              ? 'Add to Cart'
              : 'Sold Out';
          }
        }
      });
    });
  }

  // ── Quantity Selector ────────────────────────────────────────
  const qtyInput = document.getElementById('qty-input');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');

  if (qtyInput && qtyDecrease && qtyIncrease) {
    qtyDecrease.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });

    qtyIncrease.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val < 99) qtyInput.value = val + 1;
    });
  }

  // ── Announcement / Toast ─────────────────────────────────────
  window.showToast = function (message, type = 'success') {
    const existing = document.getElementById('tl-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tl-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: ${type === 'success' ? 'var(--color-primary)' : '#EF4444'};
      color: ${type === 'success' ? '#000' : '#fff'};
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      white-space: nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Auto dismiss
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(80px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ── Search Toggle ───────────────────────────────────────────
  const searchToggle = document.getElementById('search-toggle');
  const searchBar = document.getElementById('header-search-bar');
  const searchInput = document.getElementById('header-search-input');

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchBar.classList.toggle('is-active');
      const isActive = searchBar.classList.contains('is-active');
      searchToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      if (isActive && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    // Prevent closing when clicking inside the search bar
    searchBar.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close when clicking anywhere else on the document
    document.addEventListener('click', () => {
      if (searchBar.classList.contains('is-active')) {
        searchBar.classList.remove('is-active');
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchBar.classList.contains('is-active')) {
        searchBar.classList.remove('is-active');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.focus();
      }
    });
  }

  // ── Auto-resize Select Dropdown ─────────────────────────────
  const sortSelect = document.getElementById('sort-select');

  function resizeSelect(selectEl) {
    if (!selectEl) return;
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    
    // Copy select box typography settings to ensure identical text measurement
    const styles = window.getComputedStyle(selectEl);
    tempSpan.style.fontFamily = styles.fontFamily;
    tempSpan.style.fontSize = styles.fontSize;
    tempSpan.style.fontWeight = styles.fontWeight;
    tempSpan.style.letterSpacing = styles.letterSpacing;
    
    const selectedText = selectEl.options[selectEl.selectedIndex].text;
    tempSpan.textContent = selectedText;
    
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.getBoundingClientRect().width;
    document.body.removeChild(tempSpan);
    
    // padding-left + padding-right = 44px + 44px = 88px
    selectEl.style.width = (textWidth + 88) + 'px';
  }

  if (sortSelect) {
    // Run initial sizing
    resizeSelect(sortSelect);
    
    // Resize when user switches sorting method
    sortSelect.addEventListener('change', () => {
      resizeSelect(sortSelect);
    });
    
    // Run on window load to ensure custom fonts have loaded and sizes are accurate
    window.addEventListener('load', () => {
      resizeSelect(sortSelect);
    });
  }

})();