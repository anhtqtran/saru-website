import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhuyenmaiListComponent } from './khuyenmai-list.component';

describe('KhuyenmaiListComponent', () => {
  let component: KhuyenmaiListComponent;
  let fixture: ComponentFixture<KhuyenmaiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KhuyenmaiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KhuyenmaiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
