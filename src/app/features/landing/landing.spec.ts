import { TestBed } from '@angular/core/testing';
import { Landing } from './landing';

describe('Landing', () => {
  it('should render the firm name', async () => {
    const fixture = TestBed.createComponent(Landing);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('SMS Law Associates');
  });
});
