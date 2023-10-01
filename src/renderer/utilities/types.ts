export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => unknown ? A : never;
export type FalsyType = false | null | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Writeable<T extends { [x: string]: any }> = {
  -readonly [P in keyof T]: T[P];
}