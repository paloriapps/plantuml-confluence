import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

const SERVER_URL_KEY = 'serverUrl';

const isValidUrl = (value) =>
  typeof value === 'string' &&
  (value.startsWith('http://') || value.startsWith('https://'));

resolver.define('getServerUrl', async () => {
  const url = await kvs.get(SERVER_URL_KEY);
  return url ?? null;
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
