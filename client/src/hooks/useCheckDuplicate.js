import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const ipv4Regex =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const macRegex = /^[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}$/i;

export function useCheckDuplicate({
  ipAddress = "",
  macAddress = "",
  enabled = true,
} = {}) {
  const ipText = ipAddress.trim();
  const macText = macAddress.trim();
  const ip = ipv4Regex.test(ipText) ? ipText : "";
  const mac = macRegex.test(macText) ? macText : "";

  const [settled, setSettled] = useState(null);
  const canCheck = enabled && Boolean(ip || mac);

  useEffect(() => {
    setSettled(null);

    if (!canCheck) return;

    const timer = setTimeout(() => setSettled({ ip, mac }), 500);
    return () => clearTimeout(timer);
  }, [canCheck, ip, mac]);

  const isReady = canCheck && settled?.ip === ip && settled?.mac === mac;

  const query = useQuery({
    queryKey: ["device-duplicate-check", ip, mac],
    enabled: isReady,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const { data } = await api.get("/devices/check-duplicate", {
        params: { ip: ip || undefined, mac: mac || undefined },
        signal,
      });
      return data.data;
    },
  });

  const result = isReady && !query.isFetching ? query.data : undefined;

  return {
    ipConflict: result?.ipConflict ?? null,
    macConflict: result?.macConflict ?? null,
    isChecking: canCheck && (!isReady || query.isFetching),
    error: isReady ? query.error : null,
  };
}
