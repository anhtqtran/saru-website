import { TestBed } from '@angular/core/testing';

import { HomepageProductsService } from './homepage-products.service';

describe('HomepageProductsService', () => {
  let service: HomepageProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomepageProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
