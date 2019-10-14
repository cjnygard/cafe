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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VersionPageComponent} from './version-page.component';
import {CAFE_VERSION, VersionData} from './version-page.model';

describe('VersionPageComponent', () => {
  let component: VersionPageComponent;
  let fixture: ComponentFixture<VersionPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VersionPageComponent],
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
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.versionData.find((v) => v.key === 'suffix')).toEqual(new VersionData('suffix', '1aee5ad-dirty'));
    expect(component.versionData.find((v) => v.key === 'version')).toEqual(new VersionData('version', '0.0.0'));
  });
});
