//import {RequiredTestOptions} from '@cafe/cafe';
import {RequiredTestOptions} from './required-test.options';
import { UrlSource } from './angular-default-eventing.interface';


export class CafeRequiredTestOptions implements RequiredTestOptions {
  apiKey?: string;
  bufferInterval?: number;
  maxBufferSize?: number;

  constructor(
    {
      apiKey = null,
      bufferInterval = 60000,
      maxBufferSize = 100,
      urlSource = UrlSource.WINDOW_LOCATION,
      recordRoutingNavigation = true
    }: RequiredTestOptions ) {
    this.apiKey = apiKey;
    this.bufferInterval = bufferInterval;
    this.maxBufferSize = maxBufferSize;
  }

}
