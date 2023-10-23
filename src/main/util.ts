import { URL } from 'url';
import path from 'path';
import webpack from 'webpack';
import webpackPaths from '../../.erb/configs/webpack.paths';
import { Worker } from 'node:worker_threads';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV_DEV === 'static') {
      return `file://${path.resolve(__dirname, '../../release/app/dist/renderer/', htmlFileName)}`;
    }

    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const rebuildRenderer = (compilerOptions: webpack.Configuration) => {
  const promise = new Promise((res, rej) => {    
    const compiler = webpack(compilerOptions);
    compiler.run((err) => {
      if (err) {
        rej(err)
        return;
      }

      res(true);
    });
  });

  return promise;
}

export const useWorker = (fullpath: string) => {
  return new Worker(path.join(webpackPaths.srcMainPath, './workers/worker-loader.js'), {
    workerData: {
      path: fullpath,
    },
  });
}