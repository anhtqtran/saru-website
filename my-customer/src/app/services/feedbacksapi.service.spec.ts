import { TestBed } from '@angular/core/testing';

import { FeedbacksapiService } from './feedbacksapi.service';

describe('FeedbacksapiService', () => {
  let service: FeedbacksapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedbacksapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
