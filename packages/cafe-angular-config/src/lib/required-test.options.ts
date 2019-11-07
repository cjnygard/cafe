import {TestOptions} from '@cafe/cafe';
import { UrlSource } from './angular-default-eventing.interface';

export interface RequiredTestOptions extends TestOptions {
  readonly maxBufferSize?: number;
  readonly urlSource?: UrlSource;
  readonly recordRoutingNavigation?: boolean;
}
