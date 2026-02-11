import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";


export async function getSecretFromAWS(secretName: string): Promise<string | undefined> {
  // 1) Inicializa el cliente con configuración (puedes agregar region/credentials)

  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-east-1",
    // no es obligatorio especificar credenciales aquí si están en entorno
  });

  try {
    // 2) Construye y envía la petición
    const command = new GetSecretValueCommand({
      SecretId: secretName, // usa el nombre del secreto creado
    });

    // El método correcto para enviar el comando es 'send' en el cliente v3
    const response = await client.send(command);

    // 3) Maneja la respuesta
    if (response.SecretString) {
      console.log("SecretString:", response.SecretString);
      return response.SecretString;
    }

    if (response.SecretBinary) {
      // si el secreto está en binario, conviértelo a string si lo necesitas
      const buff = Buffer.from(response.SecretBinary as Uint8Array);
      const binarySecret = buff.toString("utf-8");
      console.log("SecretBinary:", binarySecret);
      return binarySecret;
    }
  } catch (error) {
    console.error("Error al obtener el secreto:", error);
    throw error;
  }
  // Si no hay valor, retorna undefined
  return undefined;
}
