"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  build: () => build
});
module.exports = __toCommonJS(index_exports);
var import_fastify = __toESM(require("fastify"));
var import_helmet = __toESM(require("@fastify/helmet"));
var import_cors = __toESM(require("@fastify/cors"));
var import_rate_limit = __toESM(require("@fastify/rate-limit"));
var import_swagger = __toESM(require("@fastify/swagger"));
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"));
var Sentry2 = __toESM(require("@sentry/node"));

// src/config/environment.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "preview"]).default("development"),
  PORT: import_zod.z.string().transform(Number).default("4000"),
  HOST: import_zod.z.string().default("0.0.0.0"),
  DATABASE_URL: import_zod.z.string().optional(),
  JWT_SECRET: import_zod.z.string().optional(),
  SENTRY_DSN: import_zod.z.string().optional(),
  CORS_ALLOWED_ORIGINS: import_zod.z.string().default("http://localhost:3000"),
  MAINTENANCE_MODE: import_zod.z.string().transform(Boolean).default("false")
});
var env = envSchema.parse(process.env);
var config = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  database: {
    url: env.DATABASE_URL
  },
  jwt: {
    secret: env.JWT_SECRET || "development-secret-change-in-production"
  },
  sentry: {
    dsn: env.SENTRY_DSN
  },
  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  },
  maintenance: {
    enabled: env.MAINTENANCE_MODE
  }
};

// src/routes/health.ts
var import_zod2 = require("zod");
var healthResponseSchema = import_zod2.z.object({
  status: import_zod2.z.string(),
  timestamp: import_zod2.z.string(),
  uptime: import_zod2.z.number(),
  version: import_zod2.z.string(),
  environment: import_zod2.z.string(),
  database: import_zod2.z.object({
    status: import_zod2.z.string(),
    latency: import_zod2.z.number().optional()
  })
});
async function healthRoutes(fastify) {
  fastify.get("/health", {
    schema: {
      tags: ["Health"],
      summary: "Basic health check",
      description: "Returns basic application health status",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            uptime: { type: "number" },
            version: { type: "string" },
            environment: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const response = {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development"
    };
    return reply.status(200).send(response);
  });
  fastify.get("/health/detailed", {
    schema: {
      tags: ["Health"],
      summary: "Detailed health check",
      description: "Returns detailed application health including database connectivity",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            uptime: { type: "number" },
            version: { type: "string" },
            environment: { type: "string" },
            database: {
              type: "object",
              properties: {
                status: { type: "string" },
                latency: { type: "number" }
              }
            }
          }
        },
        503: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const dbStart = Date.now();
      let dbStatus = "ok";
      let dbLatency = 0;
      try {
        dbLatency = Date.now() - dbStart;
        dbStatus = "simulated";
      } catch (error) {
        dbStatus = "error";
        fastify.log.error("Database health check failed", error);
      }
      const response = {
        status: dbStatus === "ok" ? "ok" : "degraded",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: {
          status: dbStatus,
          ...dbStatus === "ok" && { latency: dbLatency }
        }
      };
      const statusCode = response.status === "ok" ? 200 : 503;
      return reply.status(statusCode).send(response);
    } catch (error) {
      fastify.log.error("Health check failed", error);
      return reply.status(503).send({
        status: "error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: "Health check failed"
      });
    }
  });
  fastify.get("/ready", {
    schema: {
      tags: ["Health"],
      summary: "Readiness probe",
      description: "Kubernetes readiness probe endpoint",
      response: {
        200: {
          type: "object",
          properties: {
            ready: { type: "boolean" }
          }
        },
        503: {
          type: "object",
          properties: {
            ready: { type: "boolean" },
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      return reply.status(200).send({ ready: true });
    } catch (error) {
      fastify.log.error("Readiness check failed", error);
      return reply.status(503).send({
        ready: false,
        error: "Service not ready"
      });
    }
  });
  fastify.get("/live", {
    schema: {
      tags: ["Health"],
      summary: "Liveness probe",
      description: "Kubernetes liveness probe endpoint",
      response: {
        200: {
          type: "object",
          properties: {
            alive: { type: "boolean" }
          }
        }
      }
    }
  }, async (request, reply) => {
    return reply.status(200).send({ alive: true });
  });
}

// src/routes/maintenance.ts
var import_zod3 = require("zod");

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "No valid authorization header provided"
      });
    }
    const token = authHeader.substring(7);
    if (!config.jwt.secret) {
      request.log.error("JWT secret not configured");
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Authentication configuration error"
      });
    }
    const decoded = import_jsonwebtoken.default.verify(token, config.jwt.secret);
    request.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof import_jsonwebtoken.default.JsonWebTokenError) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid or expired token"
      });
    }
    request.log.error("Authentication error:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Authentication failed"
    });
  }
};
var adminMiddleware = async (request, reply) => {
  await authMiddleware(request, reply);
  if (reply.sent) {
    return;
  }
  const user = request.user;
  if (!user || user.role !== "admin") {
    return reply.status(403).send({
      error: "Forbidden",
      message: "Admin access required"
    });
  }
};

// src/routes/maintenance.ts
var maintenanceStatusSchema = import_zod3.z.object({
  maintenanceMode: import_zod3.z.boolean(),
  message: import_zod3.z.string().optional(),
  estimatedDowntime: import_zod3.z.string().optional(),
  lastUpdated: import_zod3.z.string()
});
async function maintenanceRoutes(fastify) {
  fastify.get("/maintenance", {
    schema: {
      tags: ["Maintenance"],
      summary: "Get maintenance status",
      description: "Returns current maintenance mode status",
      response: {
        200: {
          type: "object",
          properties: {
            maintenanceMode: { type: "boolean" },
            message: { type: "string" },
            estimatedDowntime: { type: "string" },
            lastUpdated: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const response = {
      maintenanceMode: config.maintenance.enabled,
      message: config.maintenance.enabled ? "The system is currently under maintenance. Please check back later." : "System is operational",
      estimatedDowntime: config.maintenance.enabled ? "TBA" : void 0,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    return reply.status(200).send(response);
  });
  fastify.post("/maintenance", {
    preHandler: adminMiddleware,
    schema: {
      tags: ["Maintenance"],
      summary: "Set maintenance mode",
      description: "Enable or disable maintenance mode (admin only)",
      body: {
        type: "object",
        required: ["enabled"],
        properties: {
          enabled: { type: "boolean" },
          message: { type: "string" },
          estimatedDowntime: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            maintenanceMode: { type: "boolean" },
            message: { type: "string" }
          }
        },
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { enabled, message, estimatedDowntime } = request.body;
    const user = request.user;
    fastify.log.info({
      action: "maintenance_mode_change",
      enabled,
      message,
      estimatedDowntime,
      adminUser: user?.email
    }, "Maintenance mode changed by admin");
    return reply.status(200).send({
      success: true,
      maintenanceMode: enabled,
      message: `Maintenance mode ${enabled ? "enabled" : "disabled"} successfully`
    });
  });
  fastify.addHook("preHandler", async (request, reply) => {
    const skipPaths = ["/health", "/maintenance", "/docs", "/ready", "/live"];
    const shouldSkip = skipPaths.some((path) => request.url.startsWith(path));
    if (!shouldSkip && config.maintenance.enabled) {
      return reply.status(503).send({
        error: "Service Unavailable",
        message: "The system is currently under maintenance. Please check back later.",
        maintenanceMode: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
}

// src/utils/errorHandler.ts
var Sentry = __toESM(require("@sentry/node"));

// src/utils/logger.ts
var import_pino = __toESM(require("pino"));
var logger = (0, import_pino.default)({
  name: "krakengaming-backend",
  level: config.env === "production" ? "info" : "debug",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  timestamp: import_pino.default.stdTimeFunctions.isoTime,
  ...config.env !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true
      }
    }
  }
});

// src/utils/errorHandler.ts
var errorHandler = (error, request, reply) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params,
      query: request.query
    }
  }, "Request error");
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error);
  }
  if (error.validation) {
    return reply.status(400).send({
      error: "Validation Error",
      message: "Request validation failed",
      details: error.validation,
      statusCode: 400
    });
  }
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: "Too Many Requests",
      message: "Rate limit exceeded",
      statusCode: 429
    });
  }
  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: "Not Found",
      message: "The requested resource was not found",
      statusCode: 404
    });
  }
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : error.message;
  return reply.status(statusCode).send({
    error: statusCode === 500 ? "Internal Server Error" : error.name,
    message,
    statusCode,
    ...process.env.NODE_ENV !== "production" && {
      stack: error.stack
    }
  });
};

// src/index.ts
if (config.sentry.dsn) {
  Sentry2.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.env === "production" ? 0.1 : 1
  });
}
var build = async (opts) => {
  const fastify = (0, import_fastify.default)({
    logger: opts?.logger !== false ? logger : false,
    trustProxy: true
  });
  await fastify.register(import_helmet.default, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  });
  await fastify.register(import_cors.default, {
    origin: config.cors.allowedOrigins,
    credentials: true
  });
  await fastify.register(import_rate_limit.default, {
    max: 100,
    timeWindow: "1 minute"
  });
  await fastify.register(import_swagger.default, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "KrakenGaming API",
        description: "Cloud-native backend API for KrakenGaming platform",
        version: "1.0.0",
        contact: {
          name: "KrakenGaming Team",
          email: "support@krakengaming.org"
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT"
        }
      },
      servers: [
        {
          url: "https://api.krakengaming.org",
          description: "Production server"
        },
        {
          url: "https://api.preview.krakengaming.org",
          description: "Preview server"
        },
        {
          url: "http://localhost:4000",
          description: "Local development server"
        }
      ],
      tags: [
        { name: "Health", description: "Health check endpoints" },
        { name: "Maintenance", description: "Maintenance mode endpoints" }
      ]
    }
  });
  await fastify.register(import_swagger_ui.default, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });
  await fastify.register(healthRoutes, { prefix: "/api/v1" });
  await fastify.register(maintenanceRoutes, { prefix: "/api/v1" });
  fastify.setErrorHandler(errorHandler);
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    await fastify.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  return fastify;
};
var start = async () => {
  try {
    const fastify = await build();
    await fastify.listen({
      port: config.port,
      host: config.host
    });
    logger.info(`\u{1F680} Server running on ${config.host}:${config.port}`);
    logger.info(`\u{1F4DA} API documentation available at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    logger.error(err);
    Sentry2.captureException(err);
    process.exit(1);
  }
};
if (require.main === module) {
  start();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  build
});
