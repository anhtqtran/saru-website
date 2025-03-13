import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartmanageComponent } from './cartmanage.component';

describe('CartmanageComponent', () => {
  let component: CartmanageComponent;
  let fixture: ComponentFixture<CartmanageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartmanageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartmanageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
