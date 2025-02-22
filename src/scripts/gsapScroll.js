import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

export function initialiseGSAP() {
  console.log('🚀 GSAP Initialized');

  setupHorizontalPinning();
  setupSmoothScrolling();
}

/**
 * Sets up horizontal scrolling pinning effect with GSAP ScrollTrigger.
 */
function setupHorizontalPinning() {
  const pinContainer = document.querySelector('#section_pin');
  const triggerElement = document.querySelector('#section_to-pin');

  if (!pinContainer || !triggerElement) {
    console.warn('⚠️ Missing required elements for GSAP pinning.');
    return;
  }

  const enablePinning = () => {
    if (window.innerWidth >= 768) {
      if (!pinContainer.dataset.pinned) {
        // Prevent duplicate GSAP instances
        gsap.to(pinContainer, {
          scrollTrigger: {
            trigger: triggerElement,
            start: 'top top',
            end: () => `+=${pinContainer.scrollWidth - window.innerWidth}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
          x: () =>
            -(pinContainer.scrollWidth - document.documentElement.clientWidth) +
            'px',
          ease: 'none',
        });
        pinContainer.dataset.pinned = 'true'; // Mark as initialized
      }
    } else {
      if (pinContainer.dataset.pinned) {
        // Remove pinning when resizing below 768px
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        delete pinContainer.dataset.pinned;
      }
    }
  };

  enablePinning(); // Initial check
  window.addEventListener('resize', enablePinning); // Re-check on resize
}

/**
 * Initializes smooth scrolling using Lenis.
 */
function setupSmoothScrolling() {
  const lenis = new Lenis({
    smoothWheel: true,
    duration: 1.2,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// Auto-initialize if script runs directly
initialiseGSAP();
