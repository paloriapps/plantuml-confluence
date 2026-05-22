import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Image,
  Label,
  Text,
  TextArea,
  useConfig,
  useProductContext,
} from '@forge/react';
import { invoke } from '@forge/bridge';
import plantumlEncoder from 'plantuml-encoder';

const DEFAULT_SERVER_URL = 'https://www.plantuml.com/plantuml';

const App = () => {
  const config = useConfig();
  const context = useProductContext();
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);

  // v1: license check is a no-op stub. In v2, gate paid features here.
  // eslint-disable-next-line no-unused-vars
  const _license = context?.license?.active;

  useEffect(() => {
    let cancelled = false;
    invoke('getServerUrl')
      .then((url) => {
        if (cancelled) return;
        // Resolver guarantees a non-empty URL string (default or stored).
        setServerUrl(url ?? DEFAULT_SERVER_URL);
      })
      .catch(() => {
        if (!cancelled) setServerUrl(DEFAULT_SERVER_URL);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const source = config?.source;

  if (!source || typeof source !== 'string' || source.trim() === '') {
    return (
      <Text>
        No PlantUML source yet. Open the macro config panel and paste your
        diagram source to get started.
      </Text>
    );
  }

  const encoded = plantumlEncoder.encode(source);
  const src = `${serverUrl}/svg/${encoded}`;

  return <Image src={src} alt="PlantUML diagram" />;
};

const Config = () => {
  const config = useConfig();
  return (
    <>
      <Label labelFor="source">PlantUML source</Label>
      <TextArea
        id="source"
        name="source"
        defaultValue={config?.source ?? ''}
        placeholder={'@startuml\nAlice -> Bob: hello\n@enduml'}
      />
    </>
  );
};

ForgeReconciler.addConfig(<Config />);

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
