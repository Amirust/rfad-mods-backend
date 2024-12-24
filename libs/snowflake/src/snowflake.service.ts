import { Injectable } from '@nestjs/common';
import Snowflakify, {
  TimestampFragment,
  SequenceFragment,
} from 'snowflakify';
import { EPOCH } from '@app/types/constants';

@Injectable()
export class SnowflakeService extends Snowflakify {
  constructor() {
    super({
      fragmentArray: [
        new TimestampFragment(42, EPOCH),
        new SequenceFragment(12),
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
