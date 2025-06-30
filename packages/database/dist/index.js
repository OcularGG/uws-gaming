"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  prisma: () => prisma
});
module.exports = __toCommonJS(index_exports);
var import_client = require("@prisma/client");
__reExport(index_exports, require("@prisma/client"), module.exports);
__reExport(index_exports, require("@prisma/client"), module.exports);
var prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new import_client.PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new import_client.PrismaClient({
      log: ["query", "info", "warn", "error"]
    });
  }
  prisma = global.__prisma;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  prisma,
  ...require("@prisma/client"),
  ...require("@prisma/client")
});
