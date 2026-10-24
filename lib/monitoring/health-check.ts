
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, request } from "undici";
import ipaddr from "ipaddr.js";

export type HealthCheckResult = {
  url: string;
  status: "up" | "down";
  httpStatus: number | null;
  responseTimeMs: number;
  checkedAt: string;
  error: string | null;
};

const REQUEST_TIMEOUT_MS = 10_000;

function isPublicIp(address: string): boolean {
  try {
    return ipaddr.process(address).range() === "unicast";
  } catch {
    return false;
  }
}

async function resolvePublicAddresses(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "");

  if (isIP(normalized)) {
    if (!isPublicIp(normalized)) {
      throw new Error("Private or non-public IP addresses are not allowed.");
    }

    return [{ address: normalized, family: isIP(normalized) }];
  }

  const records = await lookup(normalized, {
    all: true,
    verbatim: true,
  });

  if (
    records.length === 0 ||
    records.some((record) => !isPublicIp(record.address))
  ) {
    throw new Error(
      "The hostname does not resolve exclusively to public IP addresses.",
    );
  }

  return records;
}

function validateUrl(input: string): URL {
  const url = new URL(input);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS websites are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid")
  ) {
    throw new Error("Local and reserved hostnames are not allowed.");
  }

  return url;
}

export async function checkWebsiteHealth(
  input: string,
): Promise<HealthCheckResult> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();

  let url: URL;
  let addresses: Awaited<ReturnType<typeof resolvePublicAddresses>>;

  try {
    url = validateUrl(input);
    addresses = await resolvePublicAddresses(url.hostname);
  } catch (error) {
    return {
      url: input,
      status: "down",
      httpStatus: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt,
      error:
        error instanceof Error
          ? error.message
          : "Website URL validation failed.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let lastError: unknown;

  try {
    // Each request gets a connector that can only select an IP address
    // returned by the validated DNS lookup above.
    for (const address of addresses) {
      const agent = new Agent({
        connect: {
          lookup: (
            _hostname,
            options,
            callback,
          ) => {
            if (options?.all) {
              callback(null, [
                {
                  address: address.address,
                  family: address.family,
                },
              ]);
            } else {
              callback(
                null,
                address.address,
                address.family,
              );
            }
          },
        },
      });

      try {
        const response = await request(url, {
          dispatcher: agent,
          method: "GET",
          signal: controller.signal,
          headersTimeout: REQUEST_TIMEOUT_MS,
          bodyTimeout: REQUEST_TIMEOUT_MS,
          headers: {
            "User-Agent": "SiteFixer-Monitor/1.0",
            Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          },
        });

        const responseTimeMs = Date.now() - startedAt;
        const isUp = response.statusCode >= 200 && response.statusCode < 400;

        await response.body.dump();

        return {
          url: url.origin,
          status: isUp ? "up" : "down",
          httpStatus: response.statusCode,
          responseTimeMs,
          checkedAt,
          error: isUp ? null : `Website returned HTTP ${response.statusCode}.`,
        };
      } catch (error) {
        lastError = error;

        console.error("[SiteFixer health check]", {
          error,
          code: (error as NodeJS.ErrnoException)?.code,
          cause: (error as Error)?.cause,
        });

        if (controller.signal.aborted) {
          break;
        }
      } finally {
        await agent.close().catch(() => undefined);
      }
    }

    const timedOut = controller.signal.aborted;

    return {
      url: url.origin,
      status: "down",
      httpStatus: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt,
      error: timedOut
        ? "Website request timed out."
        : lastError instanceof Error && lastError.message
          ? "Unable to connect to the website."
          : "Unable to connect to the website.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
