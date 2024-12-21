export interface TokenPayload {
  id: string;
  token: string
}

export const TOKEN_KEY = Symbol('TOKEN_KEY');
export type WithToken<T> = T & { [TOKEN_KEY]: TokenPayload };
