import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box,
  Button,
  Inline,
  Label,
  Link,
  SectionMessage,
  Stack,
  Text,
  Textfield,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const DEFAULT_SERVER_URL = 'https://www.plantuml.com/plantuml';

const isValidUrl = (value) =>
  typeof value === 'string' &&
  (value.startsWith('http://') || value.startsWith('https://'));

const Admin = () => {
  const [serverUrl, setServerUrlState] = useState(DEFAULT_SERVER_URL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { appearance, title, body }
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    invoke('getServerUrl')
      .then((url) => {
        if (cancelled) return;
        setServerUrlState(url ?? DEFAULT_SERVER_URL);
      })
      .catch(() => {
        if (!cancelled) setServerUrlState(DEFAULT_SERVER_URL);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const next = e?.target?.value ?? '';
    setServerUrlState(next);
    if (validationError) setValidationError(null);
  };

  const persist = async (url) => {
    setStatus(null);
    if (!isValidUrl(url)) {
      setValidationError('URL must start with http:// or https://');
      return;
    }
    setSaving(true);
    try {
      await invoke('setServerUrl', { serverUrl: url });
      setStatus({
        appearance: 'success',
        title: 'Saved',
        body: 'PlantUML server URL updated.',
      });
    } catch (err) {
      setStatus({
        appearance: 'error',
        title: 'Could not save',
        body: err?.message ?? 'Unknown error.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => persist(serverUrl);

  const handleReset = async () => {
    setServerUrlState(DEFAULT_SERVER_URL);
    setValidationError(null);
    await persist(DEFAULT_SERVER_URL);
  };

  if (loading) {
    return <Text>Loading current settings…</Text>;
  }

  return (
    <Stack space="space.200">
      <Text>
        Set the PlantUML server used to render diagrams across this site.
        Defaults to the public {DEFAULT_SERVER_URL} instance. For private data,
        host your own server and point this setting at it.
      </Text>

      <Box>
        <Label labelFor="serverUrl">PlantUML server URL</Label>
        <Textfield
          id="serverUrl"
          name="serverUrl"
          value={serverUrl}
          onChange={handleChange}
          placeholder={DEFAULT_SERVER_URL}
          isInvalid={Boolean(validationError)}
        />
        {validationError ? (
          <Text>{validationError}</Text>
        ) : null}
      </Box>

      <Inline space="space.100">
        <Button appearance="primary" onClick={handleSave} isDisabled={saving}>
          Save
        </Button>
        <Button appearance="subtle" onClick={handleReset} isDisabled={saving}>
          Reset to default
        </Button>
      </Inline>

      {status ? (
        <SectionMessage appearance={status.appearance} title={status.title}>
          <Text>{status.body}</Text>
        </SectionMessage>
      ) : null}

      <Box>
        <Text size="small" color="color.text.subtlest">
          <Link
            href="https://palori.co/changelog"
            openNewTab
          >
            What&apos;s new
          </Link>
        </Text>
      </Box>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Admin />
  </React.StrictMode>
);
