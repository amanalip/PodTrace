# PodTrace

Trace every step, from apply to running.

PodTrace is an interactive, browser-based Kubernetes visualizer and debugger. Paste any Kubernetes manifest (Pod, Deployment, Service, Ingress, ConfigMap, or multi-document stack) and step through how cluster components process, schedule, mount, and run your resources in real time.

---

## Features

- **Interactive Architecture Canvas**: Dynamic node graph rendering Control Plane (`kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager`, `cloud-controller-manager`) and Worker Nodes (`kubelet`, `containerd`, `kube-proxy`, `CoreDNS`, `CNI`, `CSI`).
- **Step-by-Step Lifecycle Animations**:
  - Pod lifecycle (9 steps from validation to running)
  - Deployment rolling updates (12 steps with ReplicaSets and multi-node pod spreading)
  - Service routing (10 steps covering ClusterIP, EndpointSlice, and iptables)
  - Ingress traffic (11 steps covering Ingress Controllers and route rules)
  - Composite multi-resource stacks (12 end-to-end steps linking Ingress, Services, and Pods)
- **15 Interactive Troubleshooting Scenarios**:
  - Debug real-world failures: CrashLoopBackOff, ImagePullBackOff, OOMKilled, Insufficient CPU, nodeSelector mismatches, taint/toleration issues, Service port mismatches, NetworkPolicy blocks, and more.
  - Live diagnostic logs, event streams, and pod condition breakdowns.
  - Real-time fix validation against edited YAML manifests.
- **Component Inspector**: Click any cluster node to inspect binary names, runtime flags, Prometheus metrics, failure modes, and debugging CLI commands.
- **"What If?" Failure Simulator**: Simulate cluster disruptions (API server outage, worker node crash, kubelet unresponsiveness, etcd quorum loss, CoreDNS crash) and view immediate impact and recovery steps.
- **Kubernetes Architecture Quiz**: 10 fact-checked questions testing core Kubernetes mechanics with instant explanations and rank badges.
- **Share & Export Engine**:
  - Shareable URL hashes storing YAML specs, step position, and color theme.
  - Mermaid Markdown sequence and graph diagram export for documentation and post-mortems.
- **Accessibility & Keyboard Navigation**:
  - Full keyboard shortcuts (`Space` to toggle animation, `Arrow` keys for steps, `Home`/`End` to jump, `Escape` to close drawers).
  - ARIA landmarks and live regions for screen readers.

---

## Tech Stack

- **Framework**: React 19, TypeScript (strict)
- **Build Tool**: Vite with vendor chunk splitting
- **State Management**: Zustand
- **Canvas / Flow**: @xyflow/react
- **Editor**: CodeMirror 6 with YAML syntax highlighting and K8s autocompletion
- **Testing**: Vitest, React Testing Library, Playwright

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher

### Installation

```bash
git clone https://github.com/amanalip/PodTrace.git
cd PodTrace
npm install
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev`: Starts the Vite local development server.
- `npm run build`: Compiles TypeScript and builds the production distribution in `dist/`.
- `npm run lint`: Runs ESLint across all source and test files.
- `npm run test`: Runs unit tests with Vitest.
- `npm run test:e2e`: Runs end-to-end smoke tests with Playwright.

---

## License

MIT
