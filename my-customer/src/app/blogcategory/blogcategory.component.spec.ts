import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogcategoryComponent } from './blogcategory.component';

describe('BlogcategoryComponent', () => {
  let component: BlogcategoryComponent;
  let fixture: ComponentFixture<BlogcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlogcategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
