import { copyFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const osmdPackageJsonPath = require.resolve("opensheetmusicdisplay/package.json")
const osmdPackageRoot = dirname(osmdPackageJsonPath)

const source = join(osmdPackageRoot, "build", "opensheetmusicdisplay.min.js")
const destination = join(
  process.cwd(),
  "src/vendor/opensheetmusicdisplay.min.txt",
)

mkdirSync(dirname(destination), { recursive: true })
copyFileSync(source, destination)

console.log(`Vendored OSMD from ${source}`)
console.log(`Wrote ${destination}`)
