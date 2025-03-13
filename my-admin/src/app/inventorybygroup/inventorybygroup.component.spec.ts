import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorybygroupComponent } from './inventorybygroup.component';

describe('InventorybygroupComponent', () => {
  let component: InventorybygroupComponent;
  let fixture: ComponentFixture<InventorybygroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventorybygroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorybygroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
