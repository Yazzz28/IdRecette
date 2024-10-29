import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietInfoComponent } from './diet-info.component';

describe('DietInfoComponent', () => {
  let component: DietInfoComponent;
  let fixture: ComponentFixture<DietInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
