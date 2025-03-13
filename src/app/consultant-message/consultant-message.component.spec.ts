import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantMessageComponent } from './consultant-message.component';

describe('ConsultantMessageComponent', () => {
  let component: ConsultantMessageComponent;
  let fixture: ComponentFixture<ConsultantMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultantMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
