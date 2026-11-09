# taskflow-app

The Taskflow to-do web application and its Dockerfile.

Part of a three-repo GitOps pipeline:

- `taskflow-infra` builds the EKS cluster.
- `taskflow-app` (this repo) builds the app. A CircleCI pipeline pushes the image tagged with the build number and then updates the image tag in `taskflow-gitops`.
- `taskflow-gitops` holds the Kubernetes manifests that ArgoCD syncs to the cluster.

## Run it

Requires Node `^22.22.2`, `^24.15.0` or 26 and newer. The test dependency `jsdom` sets the strictest range; building alone needs only `^20.19.0 || >=22.12.0`.

```sh
npm install
npm run dev        # http://localhost:5173
```

## Checks

```sh
npm run lint           # oxlint, zero warnings allowed
npm run format:check   # prettier
npm test               # vitest + Testing Library
npm run build          # production build into dist/
```

Tasks are stored in the browser's `localStorage`; there is no backend.

## Container image

Multi-stage build: Node builds the app, then only the built files go into a non-root `nginx-unprivileged` image that listens on port 8080.

```sh
docker build -t taskflow-app:dev .
docker run --rm -p 8080:8080 taskflow-app:dev   # http://localhost:8080
npm run test:image                              # builds and checks the image
```

`nginx.conf` sets long caching only for the hashed files under `/assets/` and `no-cache` for `index.html`. The security headers live in `security-headers.conf` and are included in every location that sets its own `add_header`, because nginx drops inherited headers in a location that defines any.
