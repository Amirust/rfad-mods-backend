export enum ErrorCode {
  UNKNOWN = 10000,

  // Auth
  AuthError = 20000,
  TokenInvalid,
  ThirdPartyFail,
  ThirdPartyTokenRefreshFail,
}
