/* eslint @typescript-eslint/no-duplicate-enum-values: 0 */

export enum Limits {
  ModNameMaxLength = 35,
  ModShortDescriptionMaxLength = 50,
  ModDescriptionMinLength = 25,
  ModDescriptionMaxLength = 2000,
  ModInstallGuideMinLength = 25,
  ModInstallGuideMaxLength = 1000,
  MinTagsPerMod = 1,
  MaxTagsPerMod = 5,
  MaxTagsPerPreset = 10,
  MaxImagesPerMod = 6,
  DefaultRecPerPageLimit = 6,
  DefaultUserFilesLimit = 25,
}