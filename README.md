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
