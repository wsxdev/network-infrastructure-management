import { isIPv4 } from "node:net";
import { z } from "zod";

const MAC_ADDRESS_PATTERN = /^[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}$/i;

export const checkDeviceDuplicateSchema = z
  .object({
    ip: z.string().trim().refine(isIPv4, "Dirección IPv4 no válida").optional(),
    mac: z
      .string()
      .trim()
      .regex(MAC_ADDRESS_PATTERN, "Dirección MAC no válida")
      .optional(),
  })
  .refine(({ ip, mac }) => Boolean(ip || mac), {
    message: "Ingresa una IP o una MAC para verificar.",
  });
