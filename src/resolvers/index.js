import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

const SERVER_URL_KEY = 'serverUrl';
const DEFAULT_SERVER_URL = 'https://www.plantuml.com/plantuml';

const isValidUrl = (value) =>
  typeof value === 'string' &&
  (value.startsWith('http://') || value.startsWith('https://'));

resolver.define('getServerUrl', async () => {
  // Always return a plain URL string at this boundary. The Forge bridge
  // serializes non-string return values into objects on the wire (e.g.
  // `null` becomes `{}` on the consumer side), which broke
  // `url ?? DEFAULT` in the macro frontend and rendered
  // `${serverUrl}` as `[object Object]`. Returning a string here keeps
  // the producer/consumer contract clean — every consumer receives a
  // ready-to-use URL string without per-callsite coercion.
  const stored = await kvs.get(SERVER_URL_KEY);
  return isValidUrl(stored) ? stored : DEFAULT_SERVER_URL;
});

resolver.define('setServerUrl', async ({ payload }) => {
  // Admin gating is enforced by the platform: the only UI path that invokes
  // this resolver is the `confluence:globalSettings` module, which Atlassian
  // restricts to site admins. A defense-in-depth recheck here would require
  // a heavier scope (e.g. manage:confluence-configuration) for a probe call,
  // which expands Marketplace review surface without a real security benefit
  // for this resolver's small write surface (a single URL string).
  const serverUrl = payload?.serverUrl;
  if (!isValidUrl(serverUrl)) {
    throw new Error('Invalid serverUrl: must start with http:// or https://');
  }
  await kvs.set(SERVER_URL_KEY, serverUrl);
  return { ok: true };
});

export const handler = resolver.getDefinitions();
