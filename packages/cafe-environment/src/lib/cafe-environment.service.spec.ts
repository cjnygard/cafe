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

import {TestBed, inject} from '@angular/core/testing';
import * as _ from 'lodash';

import {APP_BASE_HREF} from '@angular/common';
import {CafeEnvironmentService, DEFAULT_ENVIRONMENT_DATA} from './cafe-environment.service';
import {CAFE_ENVIRONMENTS, Environment, Environments} from './cafe-environment.model';

class EnvironmentServiceTestData {
  constructor(
    public uri: string,
    public expectedEnvironmentName: string,
    public storedUiEnvironment?: string,
    public storedDataEnvironment?: string
  ) {
  }
}

const testData: Environments = DEFAULT_ENVIRONMENT_DATA;

describe('CafeEnvironmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CafeEnvironmentService,
        {
          provide: APP_BASE_HREF,
          useValue: 'http://www.example.com'
        },
        {
          provide: CAFE_ENVIRONMENTS,
          useValue: {
            applicationName: 'portal',
            environments: DEFAULT_ENVIRONMENT_DATA,
          }
        },
      ]
    });
  });

  it('should be created', inject([CafeEnvironmentService], (service: CafeEnvironmentService) => {
    expect(service).toBeTruthy();
  }));

  it('builder should work with no overrides', () => {
    const service = new CafeEnvironmentService(
      'https://s-analytics.cengage.com/v3.0.0-SNAPSHOT',
      {
        applicationName: 'portal',
        environments: DEFAULT_ENVIRONMENT_DATA,
        overrides: {}
      },
    );
    expect(service.environmentName).toBe('staging');
  });

  it('builder should work with changed triggers', () => {
    const service = new CafeEnvironmentService(
      'https://s-analytics.cengage.com/v3.0.0-SNAPSHOT',
      {
        applicationName: 'portal',
        environments: DEFAULT_ENVIRONMENT_DATA,
        overrides: {
          environments: [
            {
              name: 'development',
              defaultEnvironmentContext: 'development'
            }
          ],
          clearTriggers: true,
          triggers: [
            {search: '^.*$', environment: 'development'}
          ]
        }
      },
    );
    expect(service.environmentName).toBe('development');
  });

  it('builder should work with overridden API', () => {
    const service = new CafeEnvironmentService(
      'https://s-analytics.cengage.com/v3.0.0-SNAPSHOT',
      {
        applicationName: 'portal',
        environments: DEFAULT_ENVIRONMENT_DATA,
        overrides: {
          environments: [
            {
              name: 'staging',
              apiEndpoint: 'https://analytics-pcaapi-staging01.cengage.info/v1',
            },
            {
              name: 'production',
              apiEndpoint: 'https://analytics-pcaapi-staging01.cengage.info/v1',
            },
          ],
        }
      },
    );
    expect(service.environmentName).toBe('staging');
    expect(service.getEnvironmentSetting('apiEndpoint')).toBe('https://analytics-pcaapi-staging01.cengage.info/v1');
  });

  const testForUri = function (testParams: EnvironmentServiceTestData) {
    if (testParams.storedUiEnvironment) {
      sessionStorage.setItem('cg_portal_debug_ui_environment', testParams.storedUiEnvironment);
    } else {
      sessionStorage.removeItem('cg_portal_debug_ui_environment');
    }
    if (testParams.storedDataEnvironment) {
      sessionStorage.setItem('cg_portal_debug_data_environment', testParams.storedDataEnvironment);
    } else {
      sessionStorage.removeItem('cg_portal_debug_data_environment');
    }
    const service = new CafeEnvironmentService(
      testParams.uri,
      {
        applicationName: 'portal',
        environments: DEFAULT_ENVIRONMENT_DATA,
      },
    );
    expect(service.applicationBaseHref).toBe(testParams.uri);
    const expectedData: Environment = _.find(
      testData.environments,
      (e) => e.name === testParams.expectedEnvironmentName
    );
    let expectedDataEnvironment = expectedData.defaultEnvironmentContext;
    if (testParams.storedDataEnvironment) {
      expectedDataEnvironment = testParams.storedDataEnvironment;
    }
    expect(service.environmentName).toBe(expectedData.name);
    expect(service.dataEnvironmentContext).toBe(expectedDataEnvironment);
    expect(service.getEnvironmentSetting('apiEndpoint')).toBe(expectedData.apiEndpoint);
    expect(service.getEnvironmentSetting('loginPageHost')).toBe(expectedData.loginPageHost);
  };

  const tests: EnvironmentServiceTestData[] = [
    new EnvironmentServiceTestData('https://s-analytics.cengage.com', 'staging'),
    new EnvironmentServiceTestData('https://s-analytics.cengage.com/v3.0.0-SNAPSHOT', 'staging'),
    new EnvironmentServiceTestData('https://s-analytics.cengage.com/v3.0.0-3/production', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/v3.0.0-SNAPSHOT', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/production', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/staging', 'staging'),
    new EnvironmentServiceTestData('https://analytics-staging01.cengage.com', 'staging'),
    new EnvironmentServiceTestData('https://analytics-production01.cengage.com', 'production'),
    new EnvironmentServiceTestData('http://localhost:4200', 'staging'),
    new EnvironmentServiceTestData('http://somebody.local', 'staging'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/portal/production', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/portal/staging', 'staging'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/portal/staging', 'production', 'production'),
    new EnvironmentServiceTestData('https://analytics.cengage.com/portal/staging', 'production', 'production', 'staging'),
    new EnvironmentServiceTestData('https://analytics-tools.cengage.info/portal', 'staging'),
  ];

  tests
    .forEach((testParams) => {
      it(`should be be created correctly for ${
        testParams.uri
        }${
        testParams.storedUiEnvironment ? ` stored ui: ${testParams.storedUiEnvironment}` : ''
        }${
        testParams.storedDataEnvironment ? ` stored data: ${testParams.storedDataEnvironment}` : ''
        }`, () => {
        testForUri(testParams);
      });
    });

});
