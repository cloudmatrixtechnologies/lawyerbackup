import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeAreas } from './practice-areas';

describe('PracticeAreas', () => {
  let component: PracticeAreas;
  let fixture: ComponentFixture<PracticeAreas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeAreas],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeAreas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
