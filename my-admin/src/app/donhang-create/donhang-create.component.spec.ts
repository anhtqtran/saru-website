import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonhangCreateComponent } from './donhang-create.component';

describe('DonhangCreateComponent', () => {
  let component: DonhangCreateComponent;
  let fixture: ComponentFixture<DonhangCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonhangCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonhangCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
