export = bigsea

interface UrlObj {
  origin: string
  path: string
  query: any
  hash: string
  url?: string
  host?: string
  href?: string
  port?: number
  protocol?: string
}

declare function bigsea(select: any): any

declare namespace bigsea {
  function Ajax(request: any): any

  function css(css: any, obj: any): string

  function deepCopy(data: any): any

  function ensure(bool: boolean, message: string): void

  function get(obj: any, path: string): any

  function has(obj: any, path: string): boolean

  function json(s: string): any

  function localStorage(key: string, val?: any): any

  function open(url: string, replace: boolean): void

  function openUrl(url: string): string

  function params(key: string, value: string): void

  function query(obj: any): any

  function random(a: number, b: number): number

  function re(s: string, flag: string): RegExp

  function set(arr: any[], path?: string): void

  function type(obj: any): string

  function url(url: any): any

  function urlFormat(obj: UrlObj): string
}
