import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials implements OnInit {
 activeIdx = 0;
  visible = 3;
  isBrowser: boolean;
 
  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // DO NOT access window in constructor — SSR has no window
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
 
  ngOnInit() {
    // Safe to access window only after checking platform
    if (this.isBrowser) {
      this.updateVisible();
    }
  }
 
  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.updateVisible();
    }
  }
 
  private updateVisible() {
    const w = window.innerWidth;
    this.visible = w >= 1280 ? 3 : w >= 768 ? 2 : 1;
    const maxIdx = this.testimonials.length - this.visible;
    if (this.activeIdx > maxIdx) {
      this.activeIdx = Math.max(0, maxIdx);
    }
  }
 
  next() {
    if (this.activeIdx < this.testimonials.length - this.visible) this.activeIdx++;
  }
  prev() {
    if (this.activeIdx > 0) this.activeIdx--;
  }
  goTo(i: number) { this.activeIdx = i; }

  // Swipe left/right on touch screens
  private touchX = 0;
  onTouchStart(e: TouchEvent) { this.touchX = e.changedTouches[0].clientX; }
  onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? this.next() : this.prev();
  }
 
  // SAMPLE CONTENT — replace with genuine client reviews (with their consent) before going live
  testimonials = [
    { text: 'They explained my property dispute in simple terms and guided me through every hearing. I always knew what was happening with my case.', name: 'Client A', role: 'Property Matter, Ammapet' },
    { text: 'The sale deed and documentation for our land were prepared carefully and registered without any delay. Very professional team.', name: 'Client B', role: 'Documentation, Salem' },
    { text: 'During a very stressful criminal case they stood by our family, handled the bail quickly and kept us informed at every step.', name: 'Client C', role: 'Criminal Matter, Salem' },
    { text: 'I visited the free legal advice centre not knowing where to start. They listened patiently and gave clear, honest advice.', name: 'Client D', role: 'Legal Advice, Ammapet' },
    { text: 'Our family matter was handled with patience and sensitivity. They made a difficult time much easier for us.', name: 'Client E', role: 'Family Matter, Salem' },
    { text: 'Our civil suit had been pending for a long time. The team prepared thoroughly and represented us with real commitment.', name: 'Client F', role: 'Civil Litigation, Salem' },
  ];
}
