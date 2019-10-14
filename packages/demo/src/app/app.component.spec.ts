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

// noinspection ES6UnusedImports
import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {CAFE_VERSION} from './version-page/version-page.model';
import {VERSION} from '../environments/version';
import {CafeEnvironmentModule, DEFAULT_ENVIRONMENT_DATA} from '@cafe/cafe-environment';
import {CafeAngularClientModule} from '@cafe/cafe-angular-client';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CafeEnvironmentModule.forRoot({
          environments: DEFAULT_ENVIRONMENT_DATA,
          applicationName: 'eventing'
        }),
        CafeAngularClientModule.forRoot({
          useBrowserGeoLocation: true,
          fetchIpAddress: true,
          recordViewingTime: true,
          recordRoutingNavigation: true,
          logErrorsToService: true,
          productPlatform: 'analytics-portal'
        }),
        HttpClientTestingModule,
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        {
          provide: CAFE_VERSION,
          useValue: VERSION
        },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
