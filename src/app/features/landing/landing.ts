import { Component } from '@angular/core';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { Home } from '../home/home';
import { About } from '../about/about';
import { Portfolio } from '../portfolio/portfolio';
import { PracticeAreas } from '../practice-areas/practice-areas';
import { Testimonials } from '../testimonials/testimonials';
import { Contact } from '../contact/contact';

@Component({
  selector: 'app-landing',
  imports: [Navbar, Footer, Home, About, Portfolio, PracticeAreas, Testimonials, Contact],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}
