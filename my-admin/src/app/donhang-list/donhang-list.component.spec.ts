import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonhangListComponent } from './donhang-list.component';

describe('DonhangListComponent', () => {
  let component: DonhangListComponent;
  let fixture: ComponentFixture<DonhangListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonhangListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonhangListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
