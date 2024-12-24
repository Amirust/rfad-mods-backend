export enum ErrorCode {
  UNKNOWN = 10000,

  // Auth
  AuthError = 20000,
  TokenInvalid,
  ThirdPartyFail,
  ThirdPartyTokenRefreshFail,

  // User
  UserError = 30000,
  UserNotFound,

  // Mods
  ModError = 40000,
  ModNotFound,
  ModNotOwned
}
