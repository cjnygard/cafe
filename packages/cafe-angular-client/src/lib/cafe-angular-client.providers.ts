import {
  Type
} from '@angular/core';
import {
  ActivatedRoute,
  Data,
  ParamMap,
  PRIMARY_OUTLET,
  Router
} from '@angular/router';
import {combineLatest, forkJoin, of} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {ClientEventing} from '@cafe/cafe-model';
import {RouterEventInformation} from './angular-default-eventing.interface';
import * as ld from 'lodash';
const _ = ld;

export const CAFE_EVENTING_CATEGORY_NAME = 'eventingCategoryName';
export const CAFE_EVENTING_ACTION_NAME = 'eventingActionName';
export const CAFE_EVENTING_TAGS = 'eventingTags';
export const CAFE_EVENTING_TAG_PARAMETERS = 'eventingTagParameters';



export class CafeAngularClientProviders {
  static defaultRouteMapper(router: Router, ignoredUrl: string): Promise<RouterEventInformation> {
    let primaryOutlet: string;
    if (router && router.routerState && router.routerState.root) {
      const ar = CafeAngularClientProviders.findPrimaryOutlet(router.routerState.root);
      if (ar) {
        if (ar.component) {
          if (ar.component instanceof Type) {
            primaryOutlet = (
              ar.component as Type<any>
            ).name;
          } else {
            primaryOutlet = `${ar.component}`;
          }
        }

        return combineLatest(
          forkJoin(ar.pathFromRoot.map(a => a.data.pipe(take(1)))),
          forkJoin(ar.pathFromRoot.map(a => a.paramMap.pipe(take(1))))
        ).pipe(
          map(
            (input: [Data[], ParamMap[]]) => {
              let category = 'ROUTER_NAVIGATION';
              let action = primaryOutlet;
              const tags: ClientEventing.ActivityTag[] = [];
              const tagParameters: string[] = [];
              input[0]
                .forEach(
                  data => {
                    if (data[CAFE_EVENTING_CATEGORY_NAME]) {
                      category = data[CAFE_EVENTING_CATEGORY_NAME];
                    }
                    if (data[CAFE_EVENTING_ACTION_NAME]) {
                      action = data[CAFE_EVENTING_ACTION_NAME];
                    }
                    if (data[CAFE_EVENTING_TAGS]) {
                      tags.push.apply(tags, data[CAFE_EVENTING_TAGS]);
                    }
                    if (data[CAFE_EVENTING_TAG_PARAMETERS]) {
                      tagParameters.push.apply(tagParameters, data[CAFE_EVENTING_TAG_PARAMETERS]);
                    }
                  }
                );
              const concatenatedTags: { [s: string]: ClientEventing.ActivityTag } = {};
              tags
                .forEach(
                  tag => {
                    concatenatedTags[tag.key] = tag;
                  }
                );
              if (input[1] && input[1].length > 0) {
                input[1]
                  .forEach(
                    paramMap => {
                      paramMap.keys
                        .filter(key => {
                          return tagParameters.indexOf(key) >= 0;
                        })
                        .forEach(
                          key => {
                            if (paramMap.has(key)) {
                              concatenatedTags[key] = {
                                'key': key,
                                'value': paramMap.get(key)
                              };
                            }
                          }
                        );
                    }
                  );
              }

              return {
                'category': category,
                'action': action,
                'tags': _.values(concatenatedTags)
              };
            }
          )
        )
          .toPromise();
      }
    }

    return of({
      category: 'ROUTER_NAVIGATION',
      action: primaryOutlet,
      tags: []
    }).toPromise();
  }

  static findPrimaryOutlet(ar: ActivatedRoute): ActivatedRoute {
    if (ar) {
      if (ar.children && ar.children.length > 0) {
        const foundArc = ar.children.find(arc => !!this.findPrimaryOutlet(arc));
        if (foundArc) {
          return this.findPrimaryOutlet(foundArc);
        }
      } else if (ar.outlet && ar.outlet === PRIMARY_OUTLET && ar.component) {
        return ar;
      }
    }

    return null;
  }
}
