import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrangchuSanphamnoibatComponent } from './trangchu-sanphamnoibat.component';

describe('TrangchuSanphamnoibatComponent', () => {
  let component: TrangchuSanphamnoibatComponent;
  let fixture: ComponentFixture<TrangchuSanphamnoibatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrangchuSanphamnoibatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrangchuSanphamnoibatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
