import webpack from 'webpack';
import { parentPort, MessagePort } from 'node:worker_threads';
import webpackRendererStdevConfig from '../../../.erb/configs/webpack.config.renderer.stdev';
import path from 'node:path';
import merge from 'webpack-merge';
import webpackPaths from '../../../.erb/configs/webpack.paths';
import { EditorRendererCompilation as ERC } from './editor.renderer-compilation.types';

const executionNotAllowedInMainThreadError = new Error('Editor renderer compilation execution is not allowed in the main thread');
function assertMessagePortExist(messagePort: MessagePort | null): asserts messagePort is MessagePort {
  if (!messagePort) {
    throw executionNotAllowedInMainThreadError;
  }
}

assertMessagePortExist(parentPort);
parentPort.on('message', async (request: ERC.Request) => {
  switch (request.type) {
    case ERC.Request.Type.Compile:
      compileRendererWithEntries(request.entries ?? []);
      break;
  }
});

export const sendResponseToParentPort = (response: ERC.Response) => {
  assertMessagePortExist(parentPort);
  parentPort.postMessage(response);
}

export const compile = (compilerOptions: webpack.Configuration) => {
  const promise = new Promise<ERC.Response>((resolve) => {
    const compiler = webpack(compilerOptions);
    compiler.run((err, stats) => {
      if (err || stats?.hasErrors()) {
        resolve({
          type: ERC.Response.Type.Result,
          compiledSuccessfuly: false,
          error: err ?? stats?.compilation.errors ?? void 0,
        })
        return;
      }
      
      resolve({
        type: ERC.Response.Type.Result,
        compiledSuccessfuly: true,
      });
    });
  });

  return promise;
}

const handleWebpackCompilationProgress = (percentage: number, message: string) => {
  const ercProgressResponse: ERC.Response.Progress = {
    type: ERC.Response.Type.Progress,
    progress: percentage,
    progressMessage: message,
  }

  sendResponseToParentPort(ercProgressResponse);
}

export const compileRendererWithEntries = async (exactEntryPaths: string[]) => {
  const relativeEntryPaths = exactEntryPaths.map(entryPath => path.relative(webpackPaths.rootPath, entryPath));

  try {
    const webpackConfig = merge(
      webpackRendererStdevConfig,
      {
        entry: {
          ['renderer.dev']: [
            (webpackRendererStdevConfig.entry as any)['renderer.dev'],
            ...relativeEntryPaths,
          ],
        },
        plugins: [
          new webpack.ProgressPlugin(handleWebpackCompilationProgress),
        ],
      },
    );
    
    const compilationResponse = await compile(webpackConfig);  
    sendResponseToParentPort(compilationResponse);
    return compilationResponse;
  } catch (error) {
    const workerResponse: ERC.Response.Result.Fail = {
      type: ERC.Response.Type.Result,
      compiledSuccessfuly: false,
      error: new Error('Unexpected compilation error', {
        cause: error,
      })
    }

    sendResponseToParentPort(workerResponse);
    return workerResponse;
  }
}