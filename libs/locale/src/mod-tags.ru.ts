import { ModTags } from '@app/types/mod-tags.enum';

export const modTagsRu = {
  [ModTags.Graphics]: 'Графика',
  [ModTags.Clothing]: 'Одежда',
  [ModTags.Environment]: 'Окружение',
  [ModTags.Characters]: 'Персонажи',
  [ModTags.Interface]: 'Интерфейс',
  [ModTags.Gameplay]: 'Геймплей',
  [ModTags.Audio]: 'Звук',
  [ModTags.QoL]: 'Удобство',
  [ModTags.Locations]: 'Локации',

  [ModTags.ENB]: 'ENB',
  [ModTags.Reshade]: 'Решейд',
  [ModTags.GraphicsPack]: 'Граф.пак',

  [ModTags.Heavy]: 'Тяжёлая',
  [ModTags.Light]: 'Лёгкая',
  [ModTags.Pack]: 'Пак',

  [ModTags.World]: 'Мир',
  [ModTags.City]: 'Город',

  [ModTags.Appearance]: 'Внешность',

  [ModTags.Extended]: 'Расширение',
  [ModTags.Fonts]: 'Шрифты',
  [ModTags.Reskin]: 'Рескин',

  [ModTags.Animations]: 'Анимации',

  [ModTags.Music]: 'Музыка',
  [ModTags.Voice]: 'Голос',
};

export const resolveModTagsRu = (
  tags: ModTags[],
  resolveCategories: boolean = false,
): string[] => {
  if (!resolveCategories)
    return tags.filter((e) => e > ModTags.LastCategory).map((tag) => modTagsRu[tag]);

  return tags.map((tag) => modTagsRu[tag]);
};

export const getAllModTagsRu = (withCategories: boolean = false): string[] => {
  if (!withCategories)
    return Object.entries(modTagsRu).filter(([ key ]) =>
      +key > ModTags.LastCategory
    ).map(([ ,value ]) => value);

  return Object.values(modTagsRu);
}