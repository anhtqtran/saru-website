import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrangchuFeedbacksComponent } from './trangchu-feedbacks.component';

describe('TrangchuFeedbacksComponent', () => {
  let component: TrangchuFeedbacksComponent;
  let fixture: ComponentFixture<TrangchuFeedbacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrangchuFeedbacksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrangchuFeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
