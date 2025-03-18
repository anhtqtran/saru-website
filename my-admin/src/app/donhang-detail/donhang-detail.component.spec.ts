import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonhangDetailComponent } from './donhang-detail.component';

describe('DonhangDetailComponent', () => {
  let component: DonhangDetailComponent;
  let fixture: ComponentFixture<DonhangDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonhangDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonhangDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
