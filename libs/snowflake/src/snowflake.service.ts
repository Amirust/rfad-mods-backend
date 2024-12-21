import { Injectable } from '@nestjs/common';
import Snowflakify, {
  TimestampFragment,
  SequenceFragment,
  ProcessFragment,
  NetworkFragment,
} from 'snowflakify';
import { EPOCH } from '@app/types/constants';

@Injectable()
export class SnowflakeService extends Snowflakify {
  constructor() {
    super({
      fragmentArray: [
        new TimestampFragment(53, EPOCH),
        new SequenceFragment(8),
        new NetworkFragment(10, 'ipv4'),
        new ProcessFragment(16),
      ],
    });
  }

  nextStringId() {
    return this.nextId().toString();
  }

  deconstruct(snowflake: string) {
    const destructured = this.destructure(snowflake);
    return {
      timestamp: destructured.find((e) => e.identifier === 'TimestampFragment')
        ?.value,
      sequence: destructured.find((e) => e.identifier === 'SequenceFragment')
        ?.value,
      process: destructured.find((e) => e.identifier === 'ProcessFragment')
        ?.value,
      ip: destructured.find((e) => e.identifier === 'NetworkFragment')?.value,
    };
  }
}
