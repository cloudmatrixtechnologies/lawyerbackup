import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  imports: [],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}
 
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!('IntersectionObserver' in window)) {
      setTimeout(() => document.querySelectorAll('.port-section .reveal').forEach(el => el.classList.add('visible')));
      return;
    }
 
    const observer = new (window as any).IntersectionObserver(
      (entries: any[]) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.12 }
    );
 
    setTimeout(() => {
      document.querySelectorAll('.port-section .reveal').forEach(el => observer.observe(el));
    }, 200);
  }
 
  advocates = [
    { name: 'R. Sasidharan', degree: 'B.A., LL.B.', initials: 'RS' },
    { name: 'V. Mithuna',    degree: 'B.A., LL.M.', initials: 'VM' },
    { name: 'R. Susindran',  degree: 'B.A., LL.B.', initials: 'RS' },
  ];

  expertise = [
    'Civil Litigation', 'Criminal Defence', 'Bail Matters', 'Cheque Bounce (Sec. 138)',
    'Property Documentation', 'Sale & Settlement Deeds', 'Wills & Succession',
    'Divorce & Maintenance', 'Legal Notices', 'Legal Consultation',
  ];

  statBand = [
    { num: '3',    label: 'Advocates'           },
    { num: '5',    label: 'Practice Areas'      },
    { num: 'Free', label: 'Legal Advice Centre' },
    { num: 'Salem', label: 'Ammapet Office'     },
  ];
}
