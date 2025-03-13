import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqdetailComponent } from './faqdetail.component';

describe('FaqdetailComponent', () => {
  let component: FaqdetailComponent;
  let fixture: ComponentFixture<FaqdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaqdetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
