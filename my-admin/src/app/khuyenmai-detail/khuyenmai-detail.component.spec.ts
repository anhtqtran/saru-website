import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhuyenmaiDetailComponent } from './khuyenmai-detail.component';

describe('KhuyenmaiDetailComponent', () => {
  let component: KhuyenmaiDetailComponent;
  let fixture: ComponentFixture<KhuyenmaiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KhuyenmaiDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KhuyenmaiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
