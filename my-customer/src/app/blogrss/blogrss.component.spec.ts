import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogrssComponent } from './blogrss.component';

describe('BlogrssComponent', () => {
  let component: BlogrssComponent;
  let fixture: ComponentFixture<BlogrssComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlogrssComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogrssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
