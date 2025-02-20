import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessresetpassComponent } from './successresetpass.component';

describe('SuccessresetpassComponent', () => {
  let component: SuccessresetpassComponent;
  let fixture: ComponentFixture<SuccessresetpassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuccessresetpassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessresetpassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
