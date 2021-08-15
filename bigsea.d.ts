export = bigsea

interface UrlObj {
  origin: string
  path: string
  query: object
  hash: string
  url?: string
  host?: string
  href?: string
  port?: number
  protocol?: string
}

declare function bigsea(select: any): any

declare namespace bigsea {
  function Ajax(request: object | string): any

  function css(css: object | string, obj: object): string

  function deepCopy(data: any): any

  function ensure(bool: boolean, message: string): void

  function get(obj: object, path: string): any

  function has(obj: object, path: string): boolean

  function json(s: string): any

  function localStorage(key: string, val: any): any

  function open(url: string, replace: boolean): void

  function openUrl(url: string): string

  function params(key: string, value: string): void

  function query(obj: object | string): object | string

  function random(a: number, b: number): number

  function re(s: string, flag: string): RegExp

  function set(arr: any[], path?: string): void

  function type(obj: any): string

  function url(url: string | UrlObj): string | UrlObj

  function urlFormat(obj: UrlObj): string
}
