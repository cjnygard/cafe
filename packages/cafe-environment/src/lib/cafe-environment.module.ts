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

import {Inject, ModuleWithProviders, NgModule} from '@angular/core';
import {CafeEnvironmentService} from './cafe-environment.service';
import {CAFE_ENVIRONMENTS, CafeEnvironmentOptions} from './cafe-environment.model';
import {APP_BASE_HREF, Location} from '@angular/common';
import {CafeEnvironmentLocationService} from './cafe-environment.location.service';
import {CafeEnvironmentHereLinkDirective} from './cafe-environment.here-link.directive';

@NgModule({
  imports: [],
  declarations: [CafeEnvironmentHereLinkDirective],
  exports: [CafeEnvironmentHereLinkDirective],
  providers: []
})
export class CafeEnvironmentModule {

  static forRoot(options: CafeEnvironmentOptions): ModuleWithProviders {
    return {
      ngModule: CafeEnvironmentModule,
      providers: [
        {
          provide: CAFE_ENVIRONMENTS,
          useValue: options
        },
        {
          provide: APP_BASE_HREF,
          useFactory: CafeEnvironmentModule.getAppBaseHref,
          deps: [CAFE_ENVIRONMENTS]
        },
        {
          provide: Location,
          useClass: CafeEnvironmentLocationService
        },
        CafeEnvironmentService
      ]
    };
  }

  static getAppBaseHref(
    @Inject(CAFE_ENVIRONMENTS) cafeEnvironmentOptions: CafeEnvironmentOptions,
  ): string {
    const environments = cafeEnvironmentOptions.environments.environments.map((e) => `/${e.name}`);
    const versionPattern = 'v\\d[^/]+';
    const searchString = '(' + document.location.protocol + '//' + document.location.host +
      '(?:/' + cafeEnvironmentOptions.applicationName + ')?' +
      '(?:/' + versionPattern + ')?' +
      '(?:' + environments.join('|') + ')?).*';
    return document.location.href.replace(new RegExp(searchString, ''), '$1');
  }

}
