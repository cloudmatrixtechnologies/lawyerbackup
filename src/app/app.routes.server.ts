import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  // Admin is private and data-driven: render in the browser only
  { path: 'admin', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
