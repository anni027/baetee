import { defineConfig, loadEnv } from "@medusajs/framework/utils"
import { applicationSecret, originList } from "./src/lib/config-security"
import { databaseOptions } from "./scripts/database-options.cjs"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const required = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be configured`)
  return value
}

const database = databaseOptions(required("DATABASE_URL"))

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: database.connection.connectionString,
    databaseSchema: database.schema,
    databaseDriverOptions: {
      connection: database.connection,
      pool: { min: 0, max: database.poolMax },
    },
    redisUrl: required("REDIS_URL"),
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "server" | "worker",
    http: {
      storeCors: originList(required("STORE_CORS"), process.env.NODE_ENV === "production", "STORE_CORS"),
      adminCors: originList(required("ADMIN_CORS"), process.env.NODE_ENV === "production", "ADMIN_CORS"),
      authCors: originList(required("AUTH_CORS"), process.env.NODE_ENV === "production", "AUTH_CORS"),
      jwtSecret: applicationSecret(required("JWT_SECRET"), "JWT_SECRET"),
      cookieSecret: applicationSecret(required("COOKIE_SECRET"), "COOKIE_SECRET"),
    },
  },
  admin: {
    disable: process.env.MEDUSA_WORKER_MODE === "worker",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    ...(process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET ? [{
      resolve: "@medusajs/medusa/payment",
      options: { providers: [{ resolve: "./src/modules/razorpay", id: "razorpay", options: {
        key_id: required("RAZORPAY_KEY_ID"), key_secret: required("RAZORPAY_KEY_SECRET"), webhook_secret: required("RAZORPAY_WEBHOOK_SECRET"),
      } }] },
    }] : []),
    { resolve: "@medusajs/medusa/caching", options: { providers: [{ resolve: "@medusajs/caching-redis", id: "caching-redis", is_default: true, options: { redisUrl: required("REDIS_URL") } }] } },
    { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: required("REDIS_URL"), jobOptions: { attempts: 8, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: { age: 86400 }, removeOnFail: { age: 604800 } } } },
    { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl: required("REDIS_URL") } } },
    { resolve: "@medusajs/medusa/locking", options: { providers: [{ resolve: "@medusajs/medusa/locking-redis", id: "locking-redis", is_default: true, options: { redisUrl: required("REDIS_URL") } }] } },
    ...(process.env.NODE_ENV === "production" ? [{
      resolve: "@medusajs/medusa/file",
      options: { providers: [{
        resolve: "@medusajs/medusa/file-s3", id: "s3",
        options: {
          file_url: required("S3_FILE_URL"), access_key_id: required("S3_ACCESS_KEY_ID"),
          secret_access_key: required("S3_SECRET_ACCESS_KEY"), region: required("S3_REGION"),
          bucket: required("S3_BUCKET"), endpoint: required("S3_ENDPOINT"),
          additional_client_config: { forcePathStyle: true },
        },
      }] },
    }] : []),
  ],
})
