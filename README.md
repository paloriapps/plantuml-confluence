# PlantUML for Confluence

A Confluence Cloud Forge app that renders PlantUML diagrams inline on pages. Paste PlantUML source into a macro, get an SVG diagram. Free tier is BYOS (bring your own server) — point the app at any PlantUML render server you control, or use the public `plantuml.com` instance by default.

## Quickstart (end users)

1. Install the app from the Atlassian Marketplace into your Confluence site.
2. Edit any page and insert the **PlantUML** macro (`/PlantUML` in the slash menu, or pick it from the macro browser).
3. Open the macro's config panel and paste your PlantUML source, for example:

   ```
   @startuml
   Alice -> Bob: hello
   Bob --> Alice: hi
   @enduml
   ```

4. Publish the page. The diagram renders as an inline SVG.

By default, diagrams are rendered by the public `https://www.plantuml.com/plantuml` server. The diagram source is sent (URL-encoded) to that server every time the page is viewed. If your diagrams contain anything sensitive, configure your own server (see below).

## BYOS — point the app at your own PlantUML server

A Confluence site admin can change the render server URL in **Confluence settings → Apps → PlantUML**.

### 1. Run the PlantUML server

The canonical option is the official Docker image:

```
docker run -d --name plantuml-server -p 8080:8080 plantuml/plantuml-server:tomcat
```

That gives you `http://your-host:8080/`. Verify it's up by visiting that URL — you should see the PlantUML demo page.

### 2. Put it behind HTTPS

Confluence Cloud pages are served over HTTPS, so the render server must be HTTPS too — browsers will block mixed content otherwise. Terminate TLS at a reverse proxy (nginx, Caddy, Traefik, a cloud load balancer, etc.) in front of the Tomcat container.

Minimal nginx example:

```
server {
  listen 443 ssl http2;
  server_name plantuml.example.com;

  ssl_certificate     /etc/letsencrypt/live/plantuml.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/plantuml.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 3. The CORS double-header gotcha (read this — it is the #1 BYOS setup failure)

The PlantUML server's bundled Tomcat **already sets** `Access-Control-Allow-Origin: *` on its responses. If your reverse proxy *also* adds an `Access-Control-Allow-Origin` header, the response ends up with two values for that header. Browsers reject duplicated CORS headers as invalid, and your diagrams will silently fail to load with a CORS error in the browser console.

You have two fixes — pick one, not both:

**Option A — let Tomcat keep emitting the header, and make sure the proxy does not add one.**

For nginx: do *not* use `add_header 'Access-Control-Allow-Origin' '*'` in the proxy block. If a parent block adds it, override with `proxy_hide_header Access-Control-Allow-Origin;` and skip re-adding it. For Caddy/Traefik: remove any `header_up` / middleware that injects CORS headers.

**Option B — make Tomcat stop emitting the header, and let the proxy add it.**

Mount a `setenv.sh` into the container that sets `JAVA_OPTS` so PlantUML's CORS filter uses a specific origin (or is effectively disabled, with the proxy taking over). For example:

```
JAVA_OPTS="$JAVA_OPTS -DPLANTUML_CORS_ALLOWED_ORIGIN=https://your-confluence-site.atlassian.net"
```

Then have the reverse proxy set whichever `Access-Control-Allow-Origin` value you want. Be sure only one layer is producing the header in the final response.

Verify with:

```
curl -sI https://plantuml.example.com/svg/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000 | grep -i access-control-allow-origin
```

You should see **exactly one** `Access-Control-Allow-Origin` line.

### 4. Configure the app

In **Confluence settings → Apps → PlantUML**, set the **PlantUML server URL** field to your HTTPS URL (e.g. `https://plantuml.example.com`) and save. New page renders will use your server immediately.

## Local development

This is a standard Forge app.

```
npm install
forge tunnel    # live local development against a dev site
forge deploy    # push a build to your Forge app
forge install   # install/upgrade on a Confluence site
npm run lint    # eslint over src/
```

You need the Forge CLI (`npm i -g @forge/cli`) and a Forge account linked to a Confluence Cloud dev site.

## How it works (architecture)

- **Macro module** renders the diagram via a UI Kit 2 React component (`src/frontend/index.jsx`).
- **Per-diagram source** is stored in the macro's config (so it lives in the page's ADF and travels with copy/paste).
- **Render server URL** is stored once per site in Forge KVS (`storage:app` scope), set via the global settings admin panel (`src/frontend/admin.jsx`).
- **Rendering is client-side** — the React component composes `${serverUrl}/svg/${plantumlEncoder.encode(source)}` and uses it as an `<Image>` src. No Forge function does the HTTP fetch, which is why the app doesn't need fetch egress for arbitrary render servers. The manifest declares `external.images: [{ address: "*" }]` to allow loading images from the operator-chosen server — the wildcard is deliberate because each install picks its own BYOS URL.

## Policies

- Privacy policy: <https://plantuml.irfanthomson.com/privacy.html>
- Terms of use: <https://plantuml.irfanthomson.com/terms.html>

Markdown sources for both are in this repo (`PRIVACY.md`, `TERMS.md`).

## License

Source-available under the [PolyForm Shield License 1.0.0](./LICENSE). You can read, audit, self-host, and modify the source freely. What you cannot do is use this source (or a derivative of it) to publish a competing PlantUML app on the Atlassian Marketplace. See [`LICENSE`](./LICENSE) for the full terms.

## Contact

`irfanthomson@gmail.com`
