import { TestBed } from '@angular/core/testing';

import { PromotionApiService } from './promotion-api.service';

describe('PromotionApiService', () => {
  let service: PromotionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromotionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
