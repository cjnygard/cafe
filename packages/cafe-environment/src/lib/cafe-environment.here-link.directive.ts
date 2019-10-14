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

import {Directive, HostBinding, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {Subscription} from 'rxjs';
import {LocationStrategy} from '@angular/common';

@Directive({
  selector: 'a[cgHereLink]'
})
export class CafeEnvironmentHereLinkDirective implements OnChanges, OnDestroy {

  private subscription: Subscription;

  @HostBinding() href: string;

  constructor(
    private router: Router,
    private locationStrategy: LocationStrategy
  ) {
    this.updateTargetUrlAndHref();
    this.subscription = router.events.subscribe((s: RouterEvent) => {
      if (s instanceof NavigationEnd) {
        this.updateTargetUrlAndHref();
      }
    });
  }

  private updateTargetUrlAndHref(): void {
    this.href = this.locationStrategy.prepareExternalUrl(this.router.url == null ? '/' : this.router.url);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateTargetUrlAndHref();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
