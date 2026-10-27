import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
  { path: '', component: Landing, title: 'SMS Law Associates | Advocates in Ammapet, Salem' },
  // Lazy-loaded so the admin code never ships with the public page
  { path: 'admin', loadComponent: () => import('./features/admin/admin').then(m => m.Admin), title: 'Bookings | SMS Law Associates' },
  { path: '**', redirectTo: '' },
];
