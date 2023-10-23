import type webpack from "webpack";

export namespace EditorRendererCompilation {
  export type Response = Response.Progress | Response.Result;
  export namespace Response {
    export enum Type {
      Progress,
      Result,
    }

    export interface Base<T extends Type = Type> {
      readonly type: T;
    }

    export interface Progress extends Base<Type.Progress> {
      readonly progress: number;
      readonly progressMessage?: string;
    }

    export type Result = Result.Fail | Result.Success;

    export namespace Result {
      export interface Base<T extends boolean = boolean> extends Response.Base<Type.Result> {
        readonly compiledSuccessfuly: T;
      }

      export interface Fail extends Base<false> {
        readonly error?: Error | webpack.WebpackError[];
      }

      export interface Success extends Base<true> {}
    }
  }

  export type Request = Request.Compile;
  export namespace Request {
    export enum Type {
      Compile = 'compile',
    }

    export interface Base<T extends Type = Type> {
      readonly type: T;
    }

    export interface Compile extends Base<Type.Compile> {
      readonly entries?: string[];
    }
  }
}
