export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => unknown ? A : never;

export type Writeable<T extends { [x: string]: any }> = {
  -readonly [P in keyof T]: T[P];
}