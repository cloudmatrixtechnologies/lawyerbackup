import { TestBed } from '@angular/core/testing';
import { Admin } from './admin';

describe('Admin', () => {
  it('should show the login form when not logged in', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 }) as any;
    const fixture = TestBed.createComponent(Admin);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Admin Login');
  });
});
