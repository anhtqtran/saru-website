import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsuccessfulComponent } from './paymentsuccessful.component';

describe('PaymentsuccessfulComponent', () => {
  let component: PaymentsuccessfulComponent;
  let fixture: ComponentFixture<PaymentsuccessfulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsuccessfulComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsuccessfulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
