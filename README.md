# taskflow-app

The Taskflow to-do web application and its Dockerfile.

Part of a three-repo GitOps pipeline:

- `taskflow-infra` builds the EKS cluster.
- `taskflow-app` (this repo) builds the app. A CircleCI pipeline pushes the image tagged with the build number and then updates the image tag in `taskflow-gitops`.
- `taskflow-gitops` holds the Kubernetes manifests that ArgoCD syncs to the cluster.
