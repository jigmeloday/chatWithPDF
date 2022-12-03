export type Methods =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export interface ApiMethods {
  get: Methods;
  post: Methods;
  put: Methods;
  delete: Methods;
  head: Methods;
  options: Methods;
  patch: Methods;
  purge: Methods;
  link: Methods;
  unlink: Methods;
}

export interface DynamicPayload {
  [key: string]: any;
}
export interface APIResponse<T> {
  data?: T;
  error?: { errors: string[] };
}
export interface GraphQlResponse {
  [key: string]: any;
}
