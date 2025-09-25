const { writeFileSync } = require("fs");
const { version } = require("./package.json");

// Generar timestamp del build
const timestamp = new Date().toISOString();

const content = `export const buildVersion = {
  version: '${version}',
  timestamp: '${timestamp}'
};`;

writeFileSync("src/environments/version.ts", content);

console.log("✅ Versión generada:", version, "Fecha:", timestamp);
