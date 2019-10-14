// Copyright 2019 Cengage Learning, Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// End license text.

import {inject, TestBed} from '@angular/core/testing';

import {Location, LocationStrategy} from '@angular/common';
import {CafeEnvironmentLocationService} from './cafe-environment.location.service';
import {MockLocationStrategy, MockPlatformLocation} from '@angular/common/testing';

class LocationServiceTestPair {
  constructor(
    public pathToNormalize: string,
    public expectedNormalizedPath: string,
  ) {
  }
}

class LocationServiceTestData {
  constructor(
    public baseUri: string,
    public valuesToTest: LocationServiceTestPair[],
  ) {
  }
}

describe('CafeEnvironmentLocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocationStrategy,
          useValue: {
            getBaseHref: () => '/',
            onPopState: () => {
            }
          }
        },
        {
          provide: Location,
          useClass: CafeEnvironmentLocationService
        },
      ]
    });
  });

  it('should be created', inject([Location], (service: CafeEnvironmentLocationService) => {
    expect(service).toBeTruthy();
  }));

  const tests: LocationServiceTestData[] = [
    new LocationServiceTestData(
      '',
      [
        new LocationServiceTestPair('', ''),
        new LocationServiceTestPair('/foo', '/foo'),
        new LocationServiceTestPair('/foo/bar', '/foo/bar'),
      ]
    ),
    new LocationServiceTestData(
      '/v0.0.15',
      [
        new LocationServiceTestPair('/v0.0.15', ''),
        new LocationServiceTestPair('/v0.0.15/foo', '/foo'),
        new LocationServiceTestPair('/v0.0.15/foo/bar', '/foo/bar'),
      ]
    ),
    new LocationServiceTestData(
      'https://s-analytics.cengage.com/v0.0.15',
      [
        new LocationServiceTestPair('/v0.0.15', ''),
        new LocationServiceTestPair('/v0.0.15/foo', '/foo'),
        new LocationServiceTestPair('/v0.0.15/foo/bar', '/foo/bar'),
      ]
    ),
  ];

  tests
    .forEach((testParams) => {
      testParams.valuesToTest
        .forEach((testPair) => {
          it(`should should correctly map ${
            testPair.pathToNormalize} to ${testPair.expectedNormalizedPath} for base uri ${testParams.baseUri}`, () => {
            const strategy = new MockLocationStrategy();
            strategy.internalBaseHref = testParams.baseUri;
            const location = new MockPlatformLocation();
            const service = new CafeEnvironmentLocationService(strategy, location);
            expect(service.normalize(testPair.pathToNormalize)).toEqual(testPair.expectedNormalizedPath);
          });
        });
    });

});
