import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrangchuBannerCamketComponent } from './trangchu-banner-camket.component';

describe('TrangchuBannerCamketComponent', () => {
  let component: TrangchuBannerCamketComponent;
  let fixture: ComponentFixture<TrangchuBannerCamketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrangchuBannerCamketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrangchuBannerCamketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
