import { CustomIdSeparator } from '@app/types/djs/custom-id-separator.enum';

// create `custom_id` with separator

export const makeCustomId = (...args: Array<string | number>) => args.join(CustomIdSeparator.Key)
