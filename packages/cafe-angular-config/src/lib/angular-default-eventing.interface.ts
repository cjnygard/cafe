import {ClientEventing} from '@cafe/cafe-model';
import {EventingOptions, TestOptions} from '@cafe/cafe';

export enum UrlSource {
  // noinspection JSUnusedGlobalSymbols
  WINDOW_LOCATION,
  // noinspection JSUnusedGlobalSymbols
  ROUTER_URL
}

export const CAFE_ERROR_LOGGING_API_KEY = 'errorLoggingApiKey';
export const CAFE_EVENTING_ENDPOINT = 'eventingEndpoint';

export interface AngularTestOptions extends TestOptions {
  urlSource?: UrlSource;
  recordRoutingNavigation?: boolean;
}

export interface AngularEventingOptions extends EventingOptions {
  urlSource?: UrlSource;
  routeMapper?: (Router, string) => Promise<RouterEventInformation>;
  recordRoutingNavigation?: boolean;
}

export interface AngularRequiredEventingOptions extends AngularEventingOptions {
  urlSource: UrlSource;
  routeMapper: (Router, string) => Promise<RouterEventInformation>;
  recordRoutingNavigation: boolean;
}

export interface RouterEventInformation {
  category: string;
  action: string;
  tags: ClientEventing.ActivityTag[];
}
