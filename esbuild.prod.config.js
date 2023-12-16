import { build } from "esbuild"

const entryPoints = [
  'src/interceptors//accept-lang.js',
  'src/interceptors/bust-cache.js',
  'src/interceptors/dedupe-gets.js',
  'src/interceptors/json-request.js',
  'src/interceptors/json-response.js',
  'src/interceptors/lrucache.js',
  'src/interceptors/reject-errors.js',
  'src/TinyFetch.js',
]

const browserConfig = {
  bundle: true,
  entryPoints,
  format: "esm",
  minify: true,
  sourcemap: true,
  outdir: "dist/esm",
}

const cjsConfig = {
  ...browserConfig,
  ...{
    format: "cjs",
    minify: false,
    sourcemap: false,
    outdir: "dist/cjs",
    target: ["node16.0"],
  },
}

const testConfig = {
  bundle: true,
  entryPoints: ["test/browser.js"],
  format: "esm",
  minify: false,
  outfile: "test/browser-bundle.js",
  sourcemap: false,
}

Promise.all([build(browserConfig), build(cjsConfig), build(testConfig)]).catch((err) => console.log("err", err))
