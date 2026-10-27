import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  year = new Date().getFullYear();
 
  quickLinks = [
    { label: 'Home',           href: '#home' },
    { label: 'About Us',       href: '#about' },
    { label: 'Practice Areas', href: '#practice-areas' },
    { label: 'Our Advocates',  href: '#portfolio' },
    { label: 'Testimonials',   href: '#testimonials' },
    { label: 'Contact Us',     href: '#contact' },
  ];
 
  areas = [
    'Civil Cases & Litigation', 'Criminal Cases & Defence',
    'Legal Advisory & Consultation', 'Property & Documentation',
    'Family Law & Other Matters', 'Free Legal Advice',
  ];
}
