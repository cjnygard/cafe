import { Observable } from 'rxjs';
import {ClientEventing} from '@cafe/cafe-model';

/*
 * If you make changes to these interfaces,, you need to make corresponding changes to RequiredEventingOptions,
 * and to DefaultEventingConfiguration.  Also a new parameter to AngularDefaultEventingOptions and a new getter
 * in that class
 */

export interface EventingOptions {
  readonly productPlatform: ClientEventing.ProductPlatform;
  readonly productEnvironment?: ClientEventing.Environment;
  readonly hostPlatform?: ClientEventing.ProductPlatform;
  readonly hostEnvironment?: ClientEventing.Environment;
  readonly userPlatform?: ClientEventing.UserPlatform;
  readonly userEnvironment?: ClientEventing.Environment;
  readonly eventingEndpoint?: string;
  readonly apiKey?: string;

  readonly bufferInterval?: number;
  readonly maxBufferSize?: number;
  readonly profileSubmissionDelay?: number;
  readonly useNativeResolution?: boolean;
  readonly useBrowserGeoLocation?: boolean;
  readonly fetchIpAddress?: boolean;
  readonly recordViewingTime?: boolean;
  readonly recordViewingTimeWhenWindowNotVisible?: boolean;
  readonly recordViewingTimeByUrl?: boolean;
  readonly recordViewingTimeContiguously?: boolean;
  readonly viewingTimeCheckInterval?: number;
  readonly viewingTimeRecordInterval?: number;
  readonly viewingTimeRecordCategory?: string;
  readonly attemptCompletionOnClose?: boolean;
  readonly installOnUnloadHandler?: boolean;
  readonly installOnErrorHandler?: boolean;
  readonly logErrorsToService?: boolean;
  readonly urlScrubber?: (url: string) => string;
  readonly urlProvider?: () => string;
}

export interface RequiredEventingOptions extends EventingOptions {
  readonly productPlatform: ClientEventing.ProductPlatform;
  readonly productEnvironment: ClientEventing.Environment;
  readonly eventingEndpoint: string;
  readonly apiKey: string;

  readonly bufferInterval: number;
  readonly maxBufferSize: number;
  readonly profileSubmissionDelay: number;
  readonly useNativeResolution: boolean;
  readonly useBrowserGeoLocation: boolean;
  readonly fetchIpAddress: boolean;
  readonly recordViewingTime: boolean;
  readonly recordViewingTimeWhenWindowNotVisible: boolean;
  readonly recordViewingTimeByUrl: boolean;
  readonly recordViewingTimeContiguously: boolean;
  readonly viewingTimeCheckInterval: number;
  readonly viewingTimeRecordInterval: number;
  readonly viewingTimeRecordCategory: string;
  readonly attemptCompletionOnClose: boolean;
  readonly installOnUnloadHandler: boolean;
  readonly installOnErrorHandler: boolean;
  readonly logErrorsToService: boolean;
  readonly urlScrubber: (url: string) => string;
  readonly urlProvider: () => string;
}

export interface EventingConfiguration extends EventingOptions {
  currentUrl(): string;

  uuid(): string;

  getIpAddress(endpoint: string): Observable<ClientEventing.Ip>;

  sendLogRecords(
    endpoint: string,
    logRecords: ClientEventing.LogRecords
  ): Observable<ClientEventing.SubmissionResponse>;

  sendActivityRecords(
    endpoint: string,
    activityRecords: ClientEventing.ActivityRecords
  ): Observable<ClientEventing.SubmissionResponse>;

  sendProfileRecords(
    endpoint: string,
    profileRecords: ClientEventing.ProfileRecords
  ): Observable<ClientEventing.SubmissionResponse>;
}

export interface GlobalContext {
  userId?: string;
  tags?: ClientEventing.ActivityTag[];
}

export interface ViewingTime {
  time: number;
  timestamp: Date;
  url: string;
  focused: boolean;
  visible: boolean;
}

export interface ActivityRecordParameters {
  eventCategory: string;
  eventAction: string;
  userId?: string;
  eventDuration?: number;
  url?: string;
  tags?: ClientEventing.ActivityTag[];
  eventDate?: Date;
}
