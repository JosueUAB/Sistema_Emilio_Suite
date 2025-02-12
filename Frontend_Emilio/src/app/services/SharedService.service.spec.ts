/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedServiceService } from './SharedService.service';

describe('Service: SharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedServiceService]
    });
  });

  it('should ...', inject([SharedServiceService], (service: SharedServiceService) => {
    expect(service).toBeTruthy();
  }));
});
