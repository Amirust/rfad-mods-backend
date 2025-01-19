import { PresetTags } from '@app/types/preset-tags.enum';

/*
  Race= 300
  Argonian ,
  Breton ,
  DarkElf ,
  HighElf ,
  Imperial ,
  Khajiit ,
  Nord ,
  Orc ,
  Redguard ,
  WoodElf ,
  SnowElf ,

  LastCategory = 319,

  // Additional
  Additional = 320,
  HighPoly ,
  Male ,
  Female ,
  Vanilla ,
  AdditionalModsRequired
 */

export const presetTagsRu = {
  [PresetTags.Race]: 'Раса',
  [PresetTags.Additional]: 'Дополнительно',

  [PresetTags.Argonian]: 'Аргонианин',
  [PresetTags.Breton]: 'Бретонец',
  [PresetTags.DarkElf]: 'Данмер',
  [PresetTags.HighElf]: 'Альтмер',
  [PresetTags.Imperial]: 'Имперец',
  [PresetTags.Khajiit]: 'Каджит',
  [PresetTags.Nord]: 'Норд',
  [PresetTags.Orc]: 'Орк',
  [PresetTags.Redguard]: 'Редгард',
  [PresetTags.WoodElf]: 'Босмер',
  [PresetTags.SnowElf]: 'Фалмер',

  [PresetTags.HighPoly]: 'Хай Поли',
  [PresetTags.Male]: 'Мужской',
  [PresetTags.Female]: 'Женский',
  [PresetTags.Vanilla]: 'Ванильный',
  [PresetTags.AdditionalModsRequired]: 'Требуются доп. моды',
};

export const resolvePresetTagsRu = (
  tags: PresetTags[],
  resolveCategories: boolean = false,
): string[] => {
  if (resolveCategories)
    return tags.filter((e) => e === PresetTags.Race || e === PresetTags.Additional).map((tag) => presetTagsRu[tag]);

  return tags.map((tag) => presetTagsRu[tag]);
};

export const getAllPresetsTagsRu = (withCategories: boolean = false): string[] => {
  if (!withCategories)
    return Object.entries(presetTagsRu).filter(([ key ]) =>
      +key !== PresetTags.Race && +key !== PresetTags.Additional
    ).map(([ , value ]) => value);

  return Object.values(presetTagsRu);
}