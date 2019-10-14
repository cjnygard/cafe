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

import {Injectable} from '@angular/core';
import {Location, LocationStrategy, PlatformLocation} from '@angular/common';


@Injectable()
export class CafeEnvironmentLocationService extends Location {

  _baseHref: string;

  _baseHrefPath: string;

  constructor(platformStrategy: LocationStrategy, platformLocation: PlatformLocation) {
    super(platformStrategy, platformLocation);
    const browserBaseHref = platformStrategy.getBaseHref();
    this._baseHref = Location.stripTrailingSlash(this.stripIndexHtml(browserBaseHref));

    if (this._baseHref.match(/^https?:\/\//)) {
      this._baseHrefPath = this._baseHref.replace(/^https?:\/\/[^\/]+(\/.+)?/, '$1');
    } else {
      this._baseHrefPath = this._baseHref;
    }
  }

  private stripBaseHref(url: string): string {
    if (this._baseHrefPath && url.startsWith(this._baseHrefPath)) {
      return url.substring(this._baseHrefPath.length);
    }
    return this._baseHref && url.startsWith(this._baseHref) ? url.substring(this._baseHref.length) : url;
  }

  // noinspection JSMethodCanBeStatic
  private stripIndexHtml(url: string): string {
    return url.replace(/\/index.html$/, '');
  }

  normalize(url: string): string {
    return Location.stripTrailingSlash(
      this.stripBaseHref(
        this.stripIndexHtml(url)
      )
    );
  }

}
