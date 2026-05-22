# Privacy Policy

_Last updated: 2026-05-20_

This privacy policy describes how the **PlantUML for Confluence** Forge app (the "App") handles data. It applies to the free, BYOS (bring your own server) tier of the App.

## Data the App stores

The App does not operate any servers or databases of its own. The data it stores lives entirely inside Atlassian's infrastructure, under your Confluence site's tenancy:

- **Diagram source text** — the PlantUML source you paste into each macro is stored as part of that macro's configuration, inside the page's Atlassian Document Format (ADF) content. It is owned and stored by Atlassian, the same way any other page content is.
- **PlantUML render server URL** — a single URL string per site, stored in Forge KVS (`storage:app` scope), which is an Atlassian-managed key-value store. This is set by a site admin from the app's settings page.

The App does not collect, store, or transmit:

- Names, emails, or any other user identifiers
- Page metadata, page titles, or page contents beyond what is in the macro itself
- IP addresses, device information, or session data

The current version also transmits no analytics or telemetry. See the "Third-party SDKs and libraries" section below for the policy on optional telemetry that future versions may introduce.

## Data the App sends to third parties

To render a diagram, the App constructs a URL of the form `<serverUrl>/svg/<encoded-source>` and uses it as the `src` of an `<img>` tag in the macro. The user's browser then fetches that URL directly. This means:

- Your **diagram source** (encoded but not encrypted) is sent to whatever PlantUML render server the site admin has configured.
- The fetch happens from the **end user's browser**, not from the App's backend.

By default, the configured server is the public PlantUML server at `https://www.plantuml.com/plantuml`, operated by the PlantUML project. PlantUML.com is a third party and has its own privacy practices — see [https://plantuml.com/](https://plantuml.com/). If your diagrams may contain sensitive information, host your own PlantUML server and point the App at it (see the README's BYOS section). When you do, no diagram data is sent to plantuml.com.

## Third-party SDKs and libraries

The App's runtime dependencies are:

- `@forge/api`, `@forge/bridge`, `@forge/react`, `@forge/resolver` — the Atlassian Forge platform SDKs, required to run as a Forge app.
- `plantuml-encoder` — a pure-JavaScript library that runs offline in the browser and encodes PlantUML source into PlantUML's compressed URL format. It does not make any network calls.

The current version of the App does not transmit analytics, telemetry, or usage data of any kind. If a future version introduces optional telemetry, it will be strictly opt-in, documented in an updated version of this policy, and never enabled by default.

## Data retention and deletion

- Diagram sources are retained for the lifetime of the page (or macro) that contains them. Deleting the macro, the page, or uninstalling the App removes them according to Atlassian's standard data lifecycle.
- The render server URL is retained until a site admin changes it or uninstalls the App. Uninstalling the App removes its Forge KVS data per Atlassian's platform policy.

## Your rights

Because the App does not store data outside Atlassian, any data subject access, correction, or deletion request that involves App-stored data can be fulfilled through Atlassian's standard tooling on your Confluence site.

## Changes

If this policy changes materially, the new version will be published in the App's repository and linked from the Atlassian Marketplace listing.

## Contact

Questions about this policy: `paloriapps@gmail.com`
