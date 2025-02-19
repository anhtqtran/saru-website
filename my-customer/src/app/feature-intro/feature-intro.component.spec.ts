import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureIntroComponent } from './feature-intro.component';

describe('FeatureIntroComponent', () => {
  let component: FeatureIntroComponent;
  let fixture: ComponentFixture<FeatureIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
