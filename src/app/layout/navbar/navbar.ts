import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  scrolled = false;
  open = false;
  active = 'home';
 
  links = [
    { id: 'home',           label: 'Home',           href: '#home' },
    { id: 'about',          label: 'About',          href: '#about' },
    { id: 'practice-areas', label: 'Practice Areas', href: '#practice-areas' },
    { id: 'portfolio',      label: 'Our Advocates',  href: '#portfolio' },
    { id: 'testimonials',   label: 'Testimonials',   href: '#testimonials' },
    { id: 'contact',        label: 'Contact',        href: '#contact' },
  ];
 
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 50;
    const ids = this.links.map(l => l.id);
    for (const id of [...ids].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) { this.active = id; break; }
    }
  }
 
  setActive(id: string) { this.active = id; this.open = false; }
  toggleMenu() { this.open = !this.open; }
  closeMenu() { this.open = false; }
}
