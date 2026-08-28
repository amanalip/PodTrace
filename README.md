# PodTrace

Trace every step, from apply to running.

PodTrace is a browser-based Kubernetes visualizer. Paste a Kubernetes YAML manifest (Pod, Deployment, Service, Ingress, and more) and see an interactive architecture diagram showing how cluster components process your manifest.

## Features

- YAML Editor with syntax highlighting and validation
- Architecture canvas showing Control Plane and Worker Node components
- Step-by-step lifecycle animation
- Explanations for each stage of the resource lifecycle
- 15 bundled learning scenarios
- Client-side execution with no backend requirements

## Local Development

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm run test
npm run test:e2e
```

## Building for Production

```bash
npm run build
```
