import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
cycleIdx = 0;
  private cycleTimer: any;
  private revealObserver: any = null;  // 'any' avoids SSR type resolution of IntersectionObserver
  isBrowser: boolean;
 
  // target = 0 → static value, no counter animation
  stats = [
    { label: 'Expert Advocates', target: 3, suffix: '',  display: '3' },
    { label: 'Practice Areas',   target: 5, suffix: '',  display: '5' },
    { label: 'Legal Advice',     target: 0, suffix: '',  display: 'Free' },
  ];
 
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
 
  ngOnInit() {
    if (!this.isBrowser) return;
 
    // Run outside Angular zone for performance (timers/observers don't need CD)
    this.zone.runOutsideAngular(() => {
 
      // Cycle headline every 3s
      this.cycleTimer = setInterval(() => {
        this.zone.run(() => { this.cycleIdx = (this.cycleIdx + 1) % 3; });
      }, 3000);
 
      // IntersectionObserver for scroll reveal (fallback: show everything)
      if (!('IntersectionObserver' in window)) {
        setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')));
        return;
      }
      this.revealObserver = new (window as any).IntersectionObserver(
        (entries: any[]) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              this.revealObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );
 
      setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
          this.revealObserver?.observe(el);
        });
        this.animateCounters();
      }, 200);
    });
  }
 
  animateCounters() {
    this.stats.forEach((stat, i) => {
      if (!stat.target) return;
      const duration = 1200;
      const step = 16;
      const steps = duration / step;
      let current = 0;
      const timer = setInterval(() => {
        current += stat.target / steps;
        if (current >= stat.target) { current = stat.target; clearInterval(timer); }
        const val = Math.floor(current);
        this.zone.run(() => {
          this.stats[i].display = `${val}${stat.suffix}`;
        });
      }, step);
    });
  }
 
  ngOnDestroy() {
    if (this.cycleTimer)     clearInterval(this.cycleTimer);
    if (this.revealObserver) this.revealObserver.disconnect();
  }
}
