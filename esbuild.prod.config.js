import { build } from "esbuild"

const entryPoints = [
  'src/TinyFetch.js',
  'src/interceptors/index.js'
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
