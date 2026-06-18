/* ============================================================
   TACTILE LAB — PRODUCT RECOMMENDER JS
   Architecture: Modular Namespace (SoC & DRY Compliant)
   File Location: projectdirectory/theme/assets/product-recommender.js
   ============================================================ */

(function () {
  'use strict';

  // ════════════════════════════════════════════════════════════
  // SHARED UTILITIES (DRY Principle)
  // ════════════════════════════════════════════════════════════
  const Utils = {
    // Standardizes currency formatting across all components
    formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    },

    // Abstracts the repetitive "remove active from siblings, add to self" pattern
    toggleActiveState(parent, selector, targetEl, activeClass = 'is-selected') {
      parent.querySelectorAll(selector).forEach(el => el.classList.remove(activeClass));
      targetEl.classList.add(activeClass);
    }
  };

  // ════════════════════════════════════════════════════════════
  // PART 1: BUILD YOUR BOARD CONFIGURATOR
  // ════════════════════════════════════════════════════════════
  const ConfiguratorModule = {
    dom: {},
    modifiers: { base: 0, switches: 0, keycaps: 0 },
    basePrice: 0,

    init() {
      this.dom.configurator = document.getElementById('board-configurator');
      if (!this.dom.configurator) return;

      // Cache DOM references to avoid repeated lookups
      this.dom.btn = document.getElementById('add-to-cart-btn');
      this.dom.totalEl = document.getElementById('configurator-total');
      this.dom.mainImage = document.getElementById('product-main-image');
      this.dom.summaries = {
        base: document.getElementById('summary-base'),
        switches: document.getElementById('summary-switches'),
        keycaps: document.getElementById('summary-keycaps'),
      };

      this.basePrice = parseInt(this.dom.btn?.dataset.basePrice || '0');

      this.bindEvents();
      this.initializeDefaultModifiers();
      this.updateTotal();
    },

    bindEvents() {
      this.dom.configurator.addEventListener('click', (e) => {
        const option = e.target.closest('.configurator__option');
        if (!option) return;

        const { group, value, price, image } = option.dataset;
        
        Utils.toggleActiveState(this.dom.configurator, `.configurator__option[data-group="${group}"]`, option);
        this.modifiers[group] = parseInt(price || '0');

        this.updateSummaryUI(group, value, image);
        this.updateTotal();
      });
    },

    initializeDefaultModifiers() {
      this.dom.configurator.querySelectorAll('.configurator__option.is-selected').forEach(o => {
        this.modifiers[o.dataset.group] = parseInt(o.dataset.price || '0');
      });
    },

    updateSummaryUI(group, value, image) {
      if (this.dom.summaries[group]) {
        this.dom.summaries[group].textContent = value;
      }
      // Handle image swapping isolated to base variant updates
      if (group === 'base' && image && this.dom.mainImage) {
        this.dom.mainImage.style.opacity = '0';
        setTimeout(() => {
          this.dom.mainImage.src = image;
          this.dom.mainImage.style.opacity = '1';
        }, 200);
      }
    },

    updateTotal() {
      const total = this.basePrice + Object.values(this.modifiers).reduce((a, b) => a + b, 0);
      if (!this.dom.totalEl) return;

      this.dom.totalEl.style.transform = 'scale(1.1)';
      this.dom.totalEl.style.color = 'var(--color-primary)';
      this.dom.totalEl.textContent = Utils.formatMoney(total);
      
      setTimeout(() => this.dom.totalEl.style.transform = 'scale(1)', 200);
    }
  };

  // ════════════════════════════════════════════════════════════
  // PART 2: PRODUCT RECOMMENDER QUIZ
  // ════════════════════════════════════════════════════════════
  
  // Data Layer isolated from UI rendering and state management (SoC Principle)
  const QuizData = {
    fallback: [{ title: 'Tactile Lab Custom', tag: 'Curated for You', price: '$299' }],
    recommendations: {
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
          premium: [{ title: 'Eclipse Pro 65%', tag: 'Endgame Silent', price: '$349' }],
          endgame: [{ title: 'Void TKL CNC', tag: 'Ultra Silent', price: '$589' }],
        },
        thock: {
          budget: [{ title: 'Thocky 65% Kit', tag: 'Deep Sound Profile', price: '$99' }],
          mid: [{ title: 'Resonance TKL', tag: 'Best Thock Value', price: '$229' }],
          premium: [{ title: 'Bass75 Aluminum', tag: 'Premium Thock', price: '$379' }],
          endgame: [{ title: 'Observatory 65', tag: 'Peak Thock', price: '$649' }],
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
    },

    getMatch(answers) {
      const useCase = answers[1] || 'enthusiast';
      const sound = answers[2] || 'thock';
      const budget = answers[3] || 'mid';

      try {
        return this.recommendations[useCase][sound][budget] || this.fallback;
      } catch {
        return this.fallback;
      }
    }
  };

  // UI, Engine State, and Event Management Layer for the Quiz Component
  const QuizModule = {
    dom: {},
    TOTAL_STEPS: 3,
    currentStep: 1,
    answers: {},

    init() {
      this.dom.quiz = document.getElementById('recommender-quiz');
      if (!this.dom.quiz) return;

      this.dom.resultsSection = document.getElementById('recommender-results');
      this.dom.resultsGrid = document.getElementById('results-grid');
      this.dom.restartBtn = document.getElementById('quiz-restart');
      this.dom.progressFill = document.getElementById('quiz-progress-fill');
      this.dom.progressText = document.getElementById('quiz-progress-text');
      this.dom.allSteps = document.querySelectorAll('.quiz-step');

      this.bindEvents();
      this.updateProgress();
    },

    bindEvents() {
      // Event handling logic delegated cleanly to matching target structures
      this.dom.quiz.addEventListener('click', (e) => {
        const option = e.target.closest('.quiz-option');
        if (!option) return;

        const stepContainer = option.closest('.quiz-step');
        const step = parseInt(stepContainer.dataset.step);
        
        Utils.toggleActiveState(stepContainer.querySelector('.quiz-step__options'), '.quiz-option', option);
        this.answers[step] = option.dataset.value;

        setTimeout(() => this.progressWorkflow(step), 300);
      });

      if (this.dom.restartBtn) {
        this.dom.restartBtn.addEventListener('click', () => this.resetQuiz());
      }
    },

    progressWorkflow(step) {
      if (step < this.TOTAL_STEPS) {
        this.goToStep(step + 1);
      } else {
        if (this.dom.progressFill) this.dom.progressFill.style.width = '100%';
        setTimeout(() => this.showResults(), 400);
      }
    },

    goToStep(step) {
      this.dom.allSteps.forEach(s => s.classList.remove('is-active'));
      const target = document.querySelector(`.quiz-step[data-step="${step}"]`);
      if (target) target.classList.add('is-active');
      
      this.currentStep = step;
      this.updateProgress();
    },

    updateProgress() {
      const percent = ((this.currentStep - 1) / this.TOTAL_STEPS) * 100;
      if (this.dom.progressFill) this.dom.progressFill.style.width = percent + '%';
      if (this.dom.progressText) this.dom.progressText.textContent = `Step ${this.currentStep} of ${this.TOTAL_STEPS}`;
    },

    showResults() {
      if (this.dom.quiz) this.dom.quiz.style.display = 'none';
      if (this.dom.resultsSection) {
        this.dom.resultsSection.style.display = 'block';
        this.renderResultsHTML();
      }
    },

    renderResultsHTML() {
      if (!this.dom.resultsGrid) return;
      const matchingProducts = QuizData.getMatch(this.answers);

      this.dom.resultsGrid.innerHTML = matchingProducts.map(product => `
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
            <h3 class="product-card__title">${product.title}</h3>
            <div class="price-wrapper">
              <span class="price">${product.price}</span>
            </div>
            <span class="product-tag">${product.tag}</span>
          </div>
          <a href="/collections/all" class="btn btn--primary product-card__quick-add"
             style="opacity:1;transform:none;margin-top:auto">
            Shop Now
          </a>
        </div>
      `).join('');
    },

    resetQuiz() {
      this.answers = {};
      this.currentStep = 1;
      if (this.dom.resultsSection) this.dom.resultsSection.style.display = 'none';
      if (this.dom.quiz) this.dom.quiz.style.display = 'block';
      
      document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('is-selected'));
      this.goToStep(1);
    }
  };

  // ════════════════════════════════════════════════════════════
  // APP INITIALIZATION ENTRYPOINT
  // ════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    ConfiguratorModule.init();
    QuizModule.init();
  });

})();