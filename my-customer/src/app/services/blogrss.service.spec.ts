import { TestBed } from '@angular/core/testing';

import { BlogrssService } from './blogrss.service';

describe('BlogrssService', () => {
  let service: BlogrssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogrssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
