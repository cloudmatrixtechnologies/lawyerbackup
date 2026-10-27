import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-practice-areas',
  imports: [],
  templateUrl: './practice-areas.html',
  styleUrl: './practice-areas.css',
})
export class PracticeAreas implements OnInit {
   
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}
 
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!('IntersectionObserver' in window)) {
      setTimeout(() => document.querySelectorAll('.pa-item.reveal').forEach(el => el.classList.add('visible')));
      return;
    }
 
    const observer = new (window as any).IntersectionObserver(
      (entries: any[]) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.1 }
    );
 
    setTimeout(() => {
      document.querySelectorAll('.pa-item.reveal').forEach(el => observer.observe(el));
    }, 200);
  }
 
  areas = [
    { title: 'Civil Cases & Litigation',      desc: 'Money suits, injunctions, recovery, contract and partition disputes handled from filing to decree.', icon: 'gavel'  },
    { title: 'Criminal Cases & Defence',      desc: 'Bail, anticipatory bail, trial defence and complaints, including cheque bounce (Sec. 138 NI Act).',  icon: 'shield' },
    { title: 'Legal Advisory & Consultation', desc: 'Clear, practical legal opinions and notices so you understand your rights before you act.',          icon: 'info'   },
    { title: 'Property & Documentation',      desc: 'Title verification, sale deeds, agreements, settlement and gift deeds, wills and registration.',      icon: 'house'  },
    { title: 'Family Law & Other Matters',    desc: 'Divorce, maintenance, child custody, domestic violence and succession matters handled with care.',     icon: 'people' },
    { title: 'Free Legal Advice Centre',      desc: 'இலவச சட்ட ஆலோசனை மையம் — free initial guidance for anyone who needs to understand their legal options.', icon: 'scale' },
  ];
}
