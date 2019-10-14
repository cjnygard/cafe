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

import {TestBed} from '@angular/core/testing';

import {VersionPageService} from './version-page.service';
import {CAFE_VERSION} from './version-page.model';

describe('VersionPageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: CAFE_VERSION,
        useValue: {
          'dirty': true,
          'raw': '1aee5ad-dirty',
          'hash': '1aee5ad',
          'distance': null,
          'tag': null,
          'semver': null,
          'suffix': '1aee5ad-dirty',
          'semverString': null,
          'version': '0.0.0'
        }
      },
    ]
  }));

  it('should be created', () => {
    const service: VersionPageService = TestBed.get(VersionPageService);
    expect(service).toBeTruthy();
    expect(service.getVersion()).toEqual('0.0.0');
  });
});
