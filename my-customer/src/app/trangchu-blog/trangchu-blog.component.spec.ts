import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrangchuBlogComponent } from './trangchu-blog.component';

describe('TrangchuBlogComponent', () => {
  let component: TrangchuBlogComponent;
  let fixture: ComponentFixture<TrangchuBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrangchuBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrangchuBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
