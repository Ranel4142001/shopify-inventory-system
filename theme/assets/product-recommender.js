/* ============================================================
   TACTILE LAB — PRODUCT RECOMMENDER JS
   Quiz-based product recommender + Build Your Board configurator
   ============================================================ */

(function () {
  'use strict';

  // ════════════════════════════════════════════════════════════
  // PART 1: BUILD YOUR BOARD CONFIGURATOR
  // ════════════════════════════════════════════════════════════

  const configurator = document.getElementById('board-configurator');

  if (configurator) {
    let basePrice = parseInt(
      document.getElementById('add-to-cart-btn')?.dataset.basePrice || '0'
    );
    let modifiers = { base: 0, switches: 0, keycaps: 0 };

    const totalEl = document.getElementById('configurator-total');
    const summaryBase = document.getElementById('summary-base');
    const summarySwitches = document.getElementById('summary-switches');
    const summaryKeycaps = document.getElementById('summary-keycaps');
    const mainImage = document.getElementById('product-main-image');

    function formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }

    function updateTotal() {
      const total = basePrice + modifiers.base + modifiers.switches + modifiers.keycaps;
      if (totalEl) {
        // Animate price change
        totalEl.style.transform = 'scale(1.1)';
        totalEl.style.color = 'var(--color-primary)';
        totalEl.textContent = formatMoney(total);
        setTimeout(() => {
          totalEl.style.transform = 'scale(1)';
        }, 200);
      }
    }

    // Handle option selection
    configurator.addEventListener('click', (e) => {
      const option = e.target.closest('.configurator__option');
      if (!option) return;

      const group = option.dataset.group;
      const value = option.dataset.value;
      const price = parseInt(option.dataset.price || '0');

      // Update selected state within group
      configurator
        .querySelectorAll(`.configurator__option[data-group="${group}"]`)
        .forEach(o => o.classList.remove('is-selected'));
      option.classList.add('is-selected');

      // Update modifier
      modifiers[group] = price;

      // Update summary
      if (group === 'base') {
        if (summaryBase) summaryBase.textContent = value;
        // Swap product image if variant image exists
        if (option.dataset.image && mainImage) {
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = option.dataset.image;
            mainImage.style.opacity = '1';
          }, 200);
        }
      } else if (group === 'switches') {
        if (summarySwitches) summarySwitches.textContent = value;
      } else if (group === 'keycaps') {
        if (summaryKeycaps) summaryKeycaps.textContent = value;
      }

      updateTotal();
    });

    // Initialize with first selections
    configurator
      .querySelectorAll('.configurator__option.is-selected')
      .forEach(o => {
        const group = o.dataset.group;
        modifiers[group] = parseInt(o.dataset.price || '0');
      });

    updateTotal();
  }

  // ════════════════════════════════════════════════════════════
  // PART 2: PRODUCT RECOMMENDER QUIZ
  // ════════════════════════════════════════════════════════════

  const quiz = document.getElementById('recommender-quiz');
  const resultsSection = document.getElementById('recommender-results');
  const resultsGrid = document.getElementById('results-grid');
  const restartBtn = document.getElementById('quiz-restart');
  const progressFill = document.getElementById('quiz-progress-fill');
  const progressText = document.getElementById('quiz-progress-text');

  if (!quiz) return;

  const TOTAL_STEPS = 3;
  let currentStep = 1;
  let answers = {};

  // ── Recommendation Engine ─────────────────────────────────
  // Maps answer combinations to product recommendations
  const recommendations = {
    gaming: {
      silent: {
        budget: [
          { title: 'Entry Linear 65%', tag: 'Best for: Silent Gaming', price: '$89' },
          { title: 'Stealth TKL', tag: 'Quiet + Fast', price: '$129' },
        ],
        mid: [
          { title: 'Phantom 75%', tag: 'Premium Silent', price: '$189' },
          { title: 'Ghost Linear Kit', tag: 'Top Pick', price: '$219' },
        ],
        premium: [
          { title: 'Eclipse Pro 65%', tag: 'Endgame Silent', price: '$349' },
        ],
        endgame: [
          { title: 'Void TKL CNC', tag: 'Ultra Silent', price: '$589' },
        ],
      },
      thock: {
        budget: [
          { title: 'Thocky 65% Kit', tag: 'Deep Sound Profile', price: '$99' },
        ],
        mid: [
          { title: 'Resonance TKL', tag: 'Best Thock Value', price: '$229' },
        ],
        premium: [
          { title: 'Bass75 Aluminum', tag: 'Premium Thock', price: '$379' },
        ],
        endgame: [
          { title: 'Observatory 65', tag: 'Peak Thock', price: '$649' },
        ],
      },
      clicky: {
        budget: [{ title: 'Clicky Starter 60%', tag: 'Classic Click', price: '$79' }],
        mid: [{ title: 'Tactile Pro TKL', tag: 'Satisfying Click', price: '$199' }],
        premium: [{ title: 'Alps Edition 65', tag: 'Legendary Click', price: '$429' }],
        endgame: [{ title: 'Clicky Endgame', tag: 'Collector\'s Choice', price: '$699' }],
      },
    },
    typing: {
      silent: {
        budget: [{ title: 'Writer 75%', tag: 'Silent Typing', price: '$109' }],
        mid: [{ title: 'Author TKL', tag: 'Long Session Ready', price: '$239' }],
        premium: [{ title: 'Prose 65%', tag: 'Premium Typing', price: '$389' }],
        endgame: [{ title: 'Manuscript', tag: 'Typing Endgame', price: '$729' }],
      },
      thock: {
        budget: [{ title: 'Tactile 75% Kit', tag: 'Typing Feel', price: '$119' }],
        mid: [{ title: 'Studio TKL', tag: 'Content Creator', price: '$249' }],
        premium: [{ title: 'Atelier 65', tag: 'Boutique Typing', price: '$419' }],
        endgame: [{ title: 'Opus 1800', tag: 'Magnum Opus', price: '$799' }],
      },
      clicky: {
        budget: [{ title: 'Typewriter 60%', tag: 'Clicky Writing', price: '$89' }],
        mid: [{ title: 'Journalist TKL', tag: 'Press Ready', price: '$219' }],
        premium: [{ title: 'Editor 65', tag: 'Professional Click', price: '$399' }],
        endgame: [{ title: 'Vintage Alps', tag: 'Collector Clicky', price: '$849' }],
      },
    },
    office: {
      silent: {
        budget: [{ title: 'Office 75% Silent', tag: 'Colleague Friendly', price: '$99' }],
        mid: [{ title: 'Desk Pro TKL', tag: 'Meeting Safe', price: '$209' }],
        premium: [{ title: 'Executive 65', tag: 'C-Suite Ready', price: '$359' }],
        endgame: [{ title: 'Corner Office', tag: 'Ultimate Quiet', price: '$599' }],
      },
      thock: {
        budget: [{ title: 'Compact Office', tag: 'Subtle Thock', price: '$109' }],
        mid: [{ title: 'Boardroom TKL', tag: 'Tasteful Sound', price: '$229' }],
        premium: [{ title: 'Conference 75', tag: 'Premium Office', price: '$379' }],
        endgame: [{ title: 'Headquarters', tag: 'Office Endgame', price: '$679' }],
      },
      clicky: {
        budget: [{ title: 'Tactile Office 65', tag: 'Work From Home', price: '$119' }],
        mid: [{ title: 'Hybrid TKL', tag: 'Versatile Office', price: '$239' }],
        premium: [{ title: 'Studio Office', tag: 'Premium WFH', price: '$399' }],
        endgame: [{ title: 'Remote Elite', tag: 'WFH Endgame', price: '$749' }],
      },
    },
    enthusiast: {
      silent: {
        budget: [{ title: 'Enthusiast Starter', tag: 'Entry Endgame', price: '$149' }],
        mid: [{ title: 'Explorer 65%', tag: 'Journey Board', price: '$279' }],
        premium: [{ title: 'Tactile Lab Pro', tag: 'Our Flagship', price: '$449' }],
        endgame: [{ title: 'TL-Obsidian', tag: 'Group Buy Exclusive', price: '$849' }],
      },
      thock: {
        budget: [{ title: 'Thock Hunter 65', tag: 'Chase the Thock', price: '$159' }],
        mid: [{ title: 'Resonator TKL', tag: 'Sound Enthusiast', price: '$299' }],
        premium: [{ title: 'TL-Brass 75', tag: 'Brass Plate Build', price: '$499' }],
        endgame: [{ title: 'TL-Cosmos', tag: 'Community Choice', price: '$999' }],
      },
      clicky: {
        budget: [{ title: 'Click Hunter 60', tag: 'Tactile Journey', price: '$139' }],
        mid: [{ title: 'Alps Explorer', tag: 'Vintage Vibes', price: '$289' }],
        premium: [{ title: 'TL-Carbon', tag: 'Carbon Fiber Build', price: '$549' }],
        endgame: [{ title: 'TL-Obsidian X', tag: 'Summit Build', price: '$1199' }],
      },
    },
  };

  function getRecommendations() {
    const useCase = answers[1] || 'enthusiast';
    const sound = answers[2] || 'thock';
    const budget = answers[3] || 'mid';

    try {
      return recommendations[useCase][sound][budget] || [
        { title: 'Tactile Lab Custom', tag: 'Curated for You', price: '$299' },
      ];
    } catch {
      return [{ title: 'Tactile Lab Custom', tag: 'Curated for You', price: '$299' }];
    }
  }

  function renderResults() {
    const recs = getRecommendations();
    if (!resultsGrid) return;

    resultsGrid.innerHTML = recs.map(rec => `
      <div class="product-card" style="cursor:pointer">
        <div class="product-card__image-wrapper">
          <div class="product-card__image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div class="product-card__badges">
            <span class="badge badge--new">Recommended</span>
          </div>
        </div>
        <div class="product-card__info">
          <p class="product-card__vendor">Tactile Lab</p>
          <h3 class="product-card__title">${rec.title}</h3>
          <div class="price-wrapper">
            <span class="price">${rec.price}</span>
          </div>
          <span class="product-tag">${rec.tag}</span>
        </div>
        <a href="/collections/all" class="btn btn--primary product-card__quick-add"
           style="opacity:1;transform:none;margin-top:auto">
          Shop Now
        </a>
      </div>
    `).join('');
  }

  function updateProgress() {
    const percent = ((currentStep - 1) / TOTAL_STEPS) * 100;
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressText) progressText.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
  }

  function goToStep(step) {
    document.querySelectorAll('.quiz-step').forEach(s => {
      s.classList.remove('is-active');
    });
    const target = document.querySelector(`.quiz-step[data-step="${step}"]`);
    if (target) target.classList.add('is-active');
    currentStep = step;
    updateProgress();
  }

  function showResults() {
    if (quiz) quiz.style.display = 'none';
    if (resultsSection) {
      resultsSection.style.display = 'block';
      renderResults();
    }
  }

  // Handle quiz option clicks
  quiz.addEventListener('click', (e) => {
    const option = e.target.closest('.quiz-option');
    if (!option) return;

    const step = parseInt(option.closest('.quiz-step').dataset.step);
    const value = option.dataset.value;

    // Mark selected
    option.closest('.quiz-step__options')
      .querySelectorAll('.quiz-option')
      .forEach(o => o.classList.remove('is-selected'));
    option.classList.add('is-selected');

    answers[step] = value;

    // Progress after brief delay
    setTimeout(() => {
      if (step < TOTAL_STEPS) {
        goToStep(step + 1);
      } else {
        // Update progress to 100% then show results
        if (progressFill) progressFill.style.width = '100%';
        setTimeout(showResults, 400);
      }
    }, 300);
  });

  // Restart quiz
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      answers = {};
      currentStep = 1;
      if (resultsSection) resultsSection.style.display = 'none';
      if (quiz) quiz.style.display = 'block';
      goToStep(1);

      // Clear selections
      document.querySelectorAll('.quiz-option').forEach(o => {
        o.classList.remove('is-selected');
      });
    });
  }

  // Initialize
  updateProgress();

})();