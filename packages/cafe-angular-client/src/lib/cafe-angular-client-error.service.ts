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

import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {CafeAngularClientService} from './cafe-angular-client.service';

@Injectable({
  providedIn: 'root'
})
export class CafeAngularClientErrorService extends ErrorHandler {

  private eventingService: CafeAngularClientService;

  constructor(private injector: Injector) {
    super();
  }

  handleError(error: any): void {
    if (!this.eventingService) {
      const es: CafeAngularClientService = this.injector.get(CafeAngularClientService);
      if (es) {
        this.eventingService = es;
      }
    }
    if (this.eventingService) {
      this.eventingService.logError(error);
    }
    super.handleError(error);
  }

}
