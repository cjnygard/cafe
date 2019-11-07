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

import {ErrorHandler, ModuleWithProviders, NgModule} from '@angular/core';
import {CAFE_EVENTING_CONFIGURATION, CafeAngularClientService} from './cafe-angular-client.service';
import {AngularEventingOptions} from './angular-default-eventing.interface';
import {CafeAngularClientComponent} from './cafe-angular-client.component';
import {CafeAngularClientErrorService} from './cafe-angular-client-error.service';

@NgModule({
  declarations: [CafeAngularClientComponent],
  imports: [],
  exports: [CafeAngularClientComponent],
  providers: []
})
export class CafeAngularClientModule {

  static forRoot(options: AngularEventingOptions): ModuleWithProviders {
    return {
      ngModule: CafeAngularClientModule,
      providers: [
        {
          provide: CAFE_EVENTING_CONFIGURATION,
          useValue: options
        },
        CafeAngularClientService,
        {
          provide: ErrorHandler,
          useClass: CafeAngularClientErrorService
        }
      ]
    };
  }

}
