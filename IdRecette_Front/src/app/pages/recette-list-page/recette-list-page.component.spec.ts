import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetteListPageComponent } from './recette-list-page.component';

describe('RecetteListPageComponent', () => {
  let component: RecetteListPageComponent;
  let fixture: ComponentFixture<RecetteListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetteListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetteListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
