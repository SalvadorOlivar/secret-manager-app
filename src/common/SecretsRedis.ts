import { createClient } from "redis";

const redis = createClient({
  url: "redis://:@localhost:6379", // ej: redis://:password@host:6379
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Conectar una sola vez
let isConnected = false;
async function ensureConnection() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

function buildKey(secretName: string) {
  // versionar keys ayuda a invalidar cache fácilmente
  return `secrets:v1:${secretName}`;
}

/**
 * Obtener secret desde Redis
 */
export async function getSecretFromRedis(
  secretName: string
): Promise<string | null> {
  await ensureConnection();
  const key = buildKey(secretName);
  return redis.get(key);
}

/**
 * Guardar secret en Redis con TTL
 */
export async function setSecretInRedis(
  secretName: string,
  value: string,
  ttlSeconds = 600 // default 10 min
): Promise<void> {
  await ensureConnection();
  const key = buildKey(secretName);
  await redis.set(key, value, { EX: ttlSeconds });
}
