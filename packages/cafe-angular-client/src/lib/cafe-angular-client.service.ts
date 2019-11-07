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

import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Type
} from '@angular/core';
import {CafeEnvironmentService} from '@cafe/cafe-environment';
import {combineLatest, forkJoin, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import * as ld from 'lodash';
import {
  ActivatedRoute,
  Data,
  NavigationEnd,
  ParamMap,
  PRIMARY_OUTLET,
  Router
} from '@angular/router';
import {map, take} from 'rxjs/operators';
import {CafeClient} from '@cafe/cafe';
import {ClientEventing} from '@cafe/cafe-model';
import {AngularDefaultEventingConfiguration} from './angular-default-eventing.configuration';
import {AngularDefaultEventingOptions} from './angular-default-eventing.options';
import {
  AngularEventingOptions,
  AngularRequiredEventingOptions,
} from './angular-default-eventing.interface';

const _ = ld;

export const CAFE_EVENTING_CONFIGURATION = new InjectionToken('CAFE_EVENTING_CONFIGURATION');

@Injectable({
  providedIn: 'root'
})
export class CafeAngularClientService extends CafeClient implements OnDestroy {

  private readonly localEnvironmentOptions: AngularRequiredEventingOptions;

  constructor(
    private environmentService: CafeEnvironmentService,
    @Inject(CAFE_EVENTING_CONFIGURATION) environmentOptions: AngularEventingOptions,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    super(new AngularDefaultEventingConfiguration(
      new AngularDefaultEventingOptions(environmentOptions),
      httpClient,
      router,
      environmentService
    ));
    this.localEnvironmentOptions = new AngularDefaultEventingOptions(environmentOptions);
    if (this.localEnvironmentOptions.recordRoutingNavigation) {
      this.subscriptions.push(router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.localEnvironmentOptions.routeMapper(router, event.urlAfterRedirects)
            .then(
              routeInfo => {
                this.recordActivity({
                  eventCategory: routeInfo.category || 'ROUTER_NAVIGATION',
                  eventAction: routeInfo.action || 'UNKNOWN',
                  tags: routeInfo.tags || []
                });
              },
              error => {
                console.error(error);
              }
            );
        }
      }));
    }
  }


  ngOnDestroy(): void {
    super.cleanup();
  }

}
