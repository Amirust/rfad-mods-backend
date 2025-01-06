/* eslint @typescript-eslint/no-duplicate-enum-values: 0 */

export enum Limits {
  ModNameMaxLength = 25,
  ModShortDescriptionMaxLength = 50,
  ModDescriptionMinLength = 25,
  ModDescriptionMaxLength = 2000,
  ModInstallGuideMinLength = 25,
  ModInstallGuideMaxLength = 1000,
  MinTagsPerMod = 1,
  MaxTagsPerMod = 5,
  MaxImagesPerMod = 6,
  DefaultRecPerPageLimit = 6,
  DefaultUserFilesLimit = 25,
}