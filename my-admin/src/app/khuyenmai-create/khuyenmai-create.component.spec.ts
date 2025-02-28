import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhuyenmaiCreateComponent } from './khuyenmai-create.component';

describe('KhuyenmaiCreateComponent', () => {
  let component: KhuyenmaiCreateComponent;
  let fixture: ComponentFixture<KhuyenmaiCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KhuyenmaiCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KhuyenmaiCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
