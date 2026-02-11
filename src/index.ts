import { getSecretFromAWS } from "./common/SecretsAWS.ts";
import { getSecretFromRedis, setSecretInRedis } from "./common/SecretsRedis.ts";



export async function getSecret(secretName: string): Promise<string> {
  // 1. Buscar en Redis.
  const cached = await getSecretFromRedis(secretName);
  if (cached) return cached;

  // 2. Buscar en AWS
  const secret = await getSecretFromAWS(secretName);

  // 3. Guardar en Redis para la próxima vez
  await setSecretInRedis(secretName, secret || "", 600); // cache por 10 min

  return secret || "";
}

getSecret("MySuperSecretSecret").then((secret) => {
  console.log("Secreto obtenido:", secret);
}).catch((err) => {
  console.error("Error al obtener el secreto:", err);
});
