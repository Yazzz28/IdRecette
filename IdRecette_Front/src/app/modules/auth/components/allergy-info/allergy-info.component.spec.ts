import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergyInfoComponent } from './allergy-info.component';

describe('AllergyInfoComponent', () => {
  let component: AllergyInfoComponent;
  let fixture: ComponentFixture<AllergyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllergyInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllergyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
