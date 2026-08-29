# PodTrace Bug Fixes and Quality Improvements Log

This document records the verified bugs, code quality improvements, and UX/UI enhancements implemented across the PodTrace codebase.

---

## 1. Verified Bug Fixes (21 Bugs Resolved)

1. **Bug 1: DiagnosticLogPanel Unrendered in Main UI**
   - **Root Cause**: `DiagnosticLogPanel.tsx` was implemented and tested in isolation but was never mounted or rendered inside `AppShell.tsx`, `Sidebar.tsx`, or `ExplanationPanel.tsx`. Users investigating troubleshooting scenarios could not view `kubectl describe` events, container logs, or pod conditions.
   - **Fix**: Integrated a dual-tab right panel allowing users to switch between "Lifecycle Trace" and "Diagnostic Logs & Events", automatically focusing Diagnostics when a scenario fails.

2. **Bug 2: Scenario Fix Validation Disconnected from YAML Editor**
   - **Root Cause**: In `YAMLEditor.tsx`, `handleDocUpdate` updated state and parsed resources but never called `checkScenarioFix(newContent, resources)`. As a result, editing the YAML manifest to resolve a troubleshooting challenge never triggered evaluation or marked the challenge as resolved.
   - **Fix**: Connected `checkScenarioFix` to the editor's update listener, providing immediate evaluation and feedback.

3. **Bug 3: Step Backward and Jump Operations Retained Future Node/Edge States**
   - **Root Cause**: `applyStepToDiagram` in `AnimationEngine.ts` only merged `nodeStatusUpdates` and `edgeStatusUpdates` onto existing node/edge states without resetting previously active nodes/edges back to `idle`/`inactive`. Stepping backward or jumping steps left obsolete active/success states on the canvas.
   - **Fix**: Refactored `applyStepToDiagram` to compute clean, deterministic states based on baseline node/edge sets and active step definitions.

4. **Bug 4: clearWhatIf Cleared Ongoing Lifecycle Step Visual State**
   - **Root Cause**: `clearWhatIf` in `store/index.ts` hard-reset all nodes to `idle` and edges to `inactive`, erasing the active animation step's highlighted nodes and flowing packets rather than restoring the current step's visual state.
   - **Fix**: Updated `clearWhatIf` to restore the diagram state corresponding to the active step in the lifecycle sequence.

5. **Bug 5: ComponentInspector Failed on Dynamically Generated Node IDs**
   - **Root Cause**: `getComponentInspectionData` only matched exact type strings. Dynamic nodes (like replica pods `node-pod-deployment-1`, worker node agents `node-kubelet-1`, or volume mounts) lacked fallbacks, causing the inspector drawer to remain empty when clicking these nodes.
   - **Fix**: Added robust prefix and type fallback matching in `getComponentInspectionData`, plus dynamic metadata display (container specs, env vars, mount targets) for pod nodes.

6. **Bug 6: Redundant Panel Header in AppShell Above Sidebar Tabs**
   - **Root Cause**: `AppShell.tsx` hardcoded a "YAML Manifest" header above `editorSlot`, creating double headers and mislabeling the panel when users switched to the Scenarios or Concepts tab.
   - **Fix**: Removed the redundant outer panel header so the tab navigation bar in `Sidebar.tsx` serves as the primary top header.

7. **Bug 7: Space Key Shortcut Triggered During Button/Form Focus**
   - **Root Cause**: In `useKeyboardShortcuts.ts`, the Space key handler called `e.preventDefault()` unconditionally when focus was on interactive buttons, select elements, or links, causing double-triggers and preventing standard keyboard form interaction.
   - **Fix**: Added checks in `useKeyboardShortcuts.ts` to ignore keypresses when the active element is a button, link, select, input, or textarea.

8. **Bug 8: What-If Failure Application Did Not Pause Running Animation**
   - **Root Cause**: Applying a What-If scenario did not stop active autoplay timers, causing subsequent animation ticks to overwrite the simulated failure state.
   - **Fix**: Updated `applyWhatIf` to pause animation playback immediately upon activation.

9. **Bug 9: Multi-Document YAML Formatter Formatting Errors**
   - **Root Cause**: `handleFormat` in `YAMLEditor.tsx` joined multi-doc dumps with `'---\n'` without ensuring proper document separation or leading delimiter formatting.
   - **Fix**: Updated `handleFormat` to format multi-document streams with valid YAML document separation.

10. **Bug 10: Ingress Mapper Fallback for Empty HTTP Rules**
    - **Root Cause**: In `ingress-mapper.ts` and `lifecycle/steps.ts`, accessing nested paths without checking for default backends or empty rules arrays led to potential undefined errors.
    - **Fix**: Added safe optional chaining and fallback defaults for Ingress and Gateway resources.

11. **Bug 11: Canvas Viewport Centering and FitView Reset**
    - **Root Cause**: Switching between single-pod and multi-node composite topologies left nodes positioned outside the visible canvas viewport.
    - **Fix**: Added automatic fit-to-view triggers and explicit zoom control buttons in the canvas toolbar.

12. **Bug 12: SamplePicker Selection Desync on External YAML Changes**
    - **Root Cause**: `SamplePicker.tsx` stored its selected ID in local component state initialized to `'simple-pod'`. When a user loaded a scenario or edited the manifest, selecting the same sample again did not fire `onChange`.
    - **Fix**: Derived select value dynamically from current store YAML and added a default placeholder option.

13. **Bug 13: FlowEdge Missing Error and Warning Label Styles and Packet Animations**
    - **Root Cause**: In `FlowEdge.tsx`, only active edges rendered animated packets, and CSS classes for error and warning labels were missing from `FlowEdge.module.css`.
    - **Fix**: Added `.edgeLabel_error` and `.edgeLabel_warning` styles and animated red and amber packet markers for failure flows.

14. **Bug 14: Service Validator Falsely Flagged ExternalName Services**
    - **Root Cause**: `validator.ts` required `spec.ports` unconditionally for all Services, flagging standard Kubernetes `type: ExternalName` services as invalid.
    - **Fix**: Updated Service validation rules to permit `ExternalName` services with valid `spec.externalName`.

15. **Bug 15: PersistentVolume Validator Permitted Empty Access Modes**
    - **Root Cause**: In `validator.ts`, checking `Array.isArray(spec.accessModes)` passed empty arrays `[]` without verifying that at least one access mode exists.
    - **Fix**: Enforced non-empty `spec.accessModes` validation for PersistentVolumes.

16. **Bug 16: CompositeMapper Unsafe Name Access on ConfigMap and Secret**
    - **Root Cause**: In `composite-mapper.ts`, `configMap.metadata.name` and `secret.metadata.name` lacked fallback defaults, risking undefined node IDs on manifests with empty metadata.
    - **Fix**: Defined safe fallback constants `cmName` and `secretName` for node IDs, labels, and connecting edges.

17. **Bug 17: ScenarioList Stale Detail View Across Tab Navigation**
    - **Root Cause**: Local selection state in `ScenarioList.tsx` persisted when switching away to the Editor or Concepts tab, trapping users on the detail view when reopening Scenarios.
    - **Fix**: Reset selected scenario state when changing category filters or returning to the scenario list.

18. **Bug 18: ComponentInspector Debug Commands Lacked Copy Handlers**
    - **Root Cause**: Diagnostic commands in the inspector drawer were rendered as plain text strings without interactive copy actions.
    - **Fix**: Added interactive copy buttons with animated confirmation checkmarks next to every CLI command.

19. **Bug 19: Export Hash Codec Crashed on Unpadded Base64 Strings**
    - **Root Cause**: `decodeStateFromHash` in `export-utils.ts` did not handle unpadded base64 strings, resulting in unhandled `atob` exceptions on partial or modified URLs.
    - **Fix**: Added safe base64 padding and structured try/catch fallbacks.

20. **Bug 20: Quiz Completed State Lacked Answer Review History**
    - **Root Cause**: Upon completing the architectural assessment, users only saw their numeric score without knowing which questions they missed or why.
    - **Fix**: Added full answer history tracking and an interactive question-by-question review section with architectural explanations.

21. **Bug 21: Concepts List Lacked Search Capability**
    - **Root Cause**: `Sidebar.tsx` rendered the full list of concept cards with no filtering mechanism, requiring manual scrolling across all component definitions.
    - **Fix**: Added a live search input filtering concept titles, definitions, and key facts in real time.

22. **Bug 22: Autocomplete Value Replacement Overwrote Key Token**
    - **Root Cause**: In `k8s-autocomplete.ts`, when completing values after `kind:` or `apiVersion:`, `context.matchBefore(/[\w\-:]*/)` included the colon `:`. Selecting a completion replaced `kind:` itself rather than inserting the value after the colon.
    - **Fix**: Sliced the completion replacement range to start after the colon when typing values.

23. **Bug 23: Browser History Shortcut Collision on Arrow Navigation**
    - **Root Cause**: In `useKeyboardShortcuts.ts`, `ArrowLeft` and `ArrowRight` called `e.preventDefault()` unconditionally, breaking browser back/forward navigation shortcuts (`Alt+Left`, `Alt+Right`, `Ctrl+Left`).
    - **Fix**: Added modifier key checks so browser navigation shortcuts pass through unaffected.

24. **Bug 24: Header Export Button Always Opened Link Tab**
    - **Root Cause**: In `Header.tsx`, both "Share" and "Export" opened `ExportModal` with static default state `'link'`. `ExportModal` ignored which button triggered the modal.
    - **Fix**: Added `initialTab` state passing `'svg'` from the Export button and `'link'` from the Share button.

25. **Bug 25: FailureOverlay Remained Fixed on Screen After Scenario Completion**
    - **Root Cause**: In `FailureOverlay.tsx`, after clicking "Complete Challenge", the victory card remained fixed on screen with no dismiss action, obscuring the diagram canvas.
    - **Fix**: Added a "Close Banner & View Diagram" action and header dismiss button.

26. **Bug 26: Scenario Load Failed to Apply Failure Visual State Immediately**
    - **Root Cause**: In `store/index.ts`, `loadScenario` and `resetScenario` set node/edge state to idle mapped baseline rather than computing `applyStepToDiagram` for the failing step, leaving the canvas idle until an extra user interaction.
    - **Fix**: Computed and applied the failure step's animated node and edge status immediately upon loading.

27. **Bug 27: Explanation Step Cards Lacked Interactive Navigation Handlers**
    - **Root Cause**: In `StepDetail.tsx` and `ExplanationPanel.tsx`, step cards in the lifecycle trace list were non-interactive divs without click-to-jump handlers.
    - **Fix**: Refactored `StepDetail` into an interactive, keyboard-accessible card that jumps to the clicked step.

28. **Bug 28: LiveRegion Announcement Missing for Scenario Fix In-Progress States**
    - **Root Cause**: In `LiveRegion.tsx`, screen reader announcements handled `failed` and `completed` but omitted `fixing` and `resolved` scenario feedback messages.
    - **Fix**: Extended `LiveRegion` to announce `failed`, `fixing`, `resolved`, and `completed` state transitions.

29. **Bug 29: Autocomplete Context Scanner Parent Scope Misidentification**
    - **Root Cause**: In `getCompletionsForContext`, comments (`# ...`) and empty lines with indentation corrupted parent block detection for `containers`, `spec`, and `metadata`.
    - **Fix**: Skipped comments and empty lines when scanning backward for parent indentation blocks.

30. **Bug 30: Diagram Reset Left Step Sequence in Desynced State**
    - **Root Cause**: In `store/index.ts`, `resetDiagram` cleared `nodes` and `edges` but left `steps` and `currentStepIndex` unreset, causing diagram/step index divergence.
    - **Fix**: Reset `steps`, `currentStepIndex`, and `isPlaying` when `resetDiagram` is invoked.

31. **Bug 31: Keyboard Shortcuts Focus Loss When Modal Opens**
    - **Root Cause**: In `KeyboardShortcutsModal.tsx`, when opened via `?` key, initial focus was not set to the close button, breaking keyboard accessibility for screen readers.
    - **Fix**: Added auto-focus to the close button when `isShortcutsOpen` becomes true.

32. **Bug 32: Canvas Toolbar and Diagram Legend Top-Right Coordinate Collision**
    - **Root Cause**: Both `CanvasToolbar.module.css` and `DiagramLegend.module.css` specified `top: 16px; right: 16px`, causing the floating toolbar to overlap the Legend toggle button.
    - **Fix**: Adjusted `CanvasToolbar` to `right: 104px` so both controls sit side-by-side with clear spacing.

33. **Bug 33: Diagram Legend Missing Error and Warning Edge Color Keys**
    - **Root Cause**: In `DiagramLegend.tsx`, Edge Status section only displayed `Inactive flow`, `Active message flow`, and `Completed action`, omitting the error (red dashed) and warning (amber dashed) failure styles added to `FlowEdge`.
    - **Fix**: Added error and warning sample keys with matching styles in `DiagramLegend.tsx` and `.module.css`.

34. **Bug 34: ScenarioList Empty Filter Search Results State Missing**
    - **Root Cause**: In `ScenarioList.tsx`, when search query matched zero scenarios, an empty container rendered without feedback or a way to reset filters.
    - **Fix**: Added an empty state with a "Reset Search & Filters" action button and clear search button.

35. **Bug 35: What-If Panel Lacked Collapsible State During Active Simulation**
    - **Root Cause**: In `WhatIfPanel.tsx`, the only way to minimize the card was to click `X`, which invoked `clearWhatIf()`, destroying the active simulation on the canvas.
    - **Fix**: Added a minimize and expand toggle button so users can collapse the card while keeping the simulation active on the canvas.

36. **Bug 36: ProgressTracker Division by Zero Guard on Empty Catalog**
    - **Root Cause**: In `ProgressTracker.tsx`, `Math.round((completed / total) * 100)` produced `NaN%` if the catalog length was 0.
    - **Fix**: Added fallback `total > 0 ? Math.min(100, Math.max(0, Math.round((completed / total) * 100))) : 0`.

37. **Bug 37: Multi-Doc YAML Splitter Handling of Delimiter Comments**
    - **Root Cause**: In `multi-doc.ts`, YAML documents with comments or whitespace after separator markers (such as `--- # Comment`) failed the exact regex check and were merged into single documents.
    - **Fix**: Updated separator matching regex to handle trailing comments and document end markers (`...`).

38. **Bug 38: ComponentInspector Tab Navigation Empty Notice Missing**
    - **Root Cause**: In `ComponentInspector.tsx`, inspecting generic cluster components with zero custom debug commands displayed an empty list without helpful guidance.
    - **Fix**: Added standard fallback guidance text when diagnostic commands list is empty.

39. **Bug 39: Mermaid Diagram Export Special Characters in Node Labels**
    - **Root Cause**: In `export-utils.ts`, `generateMermaidGraphDiagram` did not strip bracket characters `[` `]` from raw node labels, risking syntax errors in Mermaid parsers.
    - **Fix**: Sanitized square brackets and quotes across Mermaid graph generators.

40. **Bug 40: Multi-Document Empty Doc Boundary Ingestion**
    - **Root Cause**: In `multi-doc.ts`, consecutive `---` delimiters generated empty chunk strings that produced parsing warnings.
    - **Fix**: Trimmed and validated non-empty content before pushing chunks.

41. **Bug 41: ExportModal UTF-8 Character Encoding in File Downloads**
    - **Root Cause**: In `export-utils.ts`, `downloadFile` created blobs with raw MIME types without explicitly declaring `charset=utf-8`, risking character corruption on unicode content.
    - **Fix**: Declared `charset=utf-8` in download blob options.

---

## 2. Code Quality and Testing Improvements (40 Improvements)

1. **Deterministic Lifecycle State Machine**: Refactored animation status calculation to ensure idempotent forward, backward, reset, and step-jump transitions.
2. **End-to-End Scenario Fix Flow**: Integrated live YAML validation, diagnostic feedback updates, and scenario completion tracking into an end-to-end reactive pipeline.
3. **Comprehensive Component Inspection Registry**: Added container details, environment variables, volumes, and health probe inspection metadata to workload nodes.
4. **Toast Notification Engine**: Created a centralized, accessible Toast notification system for copy actions, format confirmations, and scenario resolutions.
5. **Interactive Step Navigation**: Enabled direct scrubbing and jumping to any step by clicking step pills in the playback indicator.
6. **Keyboard Shortcuts Modal**: Created a dedicated shortcuts reference modal accessible via keyboard (`?`) or header icon.
7. **Enhanced Accessibility and Focus Management**: Added ARIA live announcements for scenario failures and successes, plus visible focus outlines.
8. **Right-Panel Diagnostics Tab**: Created an integrated right-panel view for inspecting `kubectl describe` events, container stdout/stderr logs, and condition matrices alongside step traces.
9. **Automated Unit and Regression Test Suite**: Expanded unit tests to cover scenario fix evaluation, backward animation stepping, What-If recovery, and toast notifications.
10. **Clean Bundle Code Splitting**: Maintained strict manualChunks vendor boundaries under 400 kB for fast loading and optimal browser caching.
11. **Dedicated Canvas Viewport Toolbar Component**: Built `<CanvasToolbar />` providing smooth `fitView`, `zoomIn`, `zoomOut`, and `resetView` operations with accessible keyboard controls.
12. **Reactive SamplePicker Architecture**: Refactored `SamplePicker` with dynamic value binding and category optgroup grouping.
13. **Real-Time Diagnostic Log Search Pipeline**: Added memoized filtering across `kubectl describe` events and container logs in `DiagnosticLogPanel.tsx`.
14. **Service and Storage Validation Matrix**: Expanded `validator.ts` to validate `ExternalName`, `NodePort`, `LoadBalancer`, and storage claims against Kubernetes API specifications.
15. **URL-Safe Base64 Export Codec**: Hardened URL hash serialization and deserialization with padding compensation and error boundaries.
16. **Full Quiz History & Review Architecture**: Added stateful answer history collection and review components in `QuizModal.tsx`.
17. **DiagnosticLogPanel Unit Test Suite**: Created `DiagnosticLogPanel.test.tsx` verifying search filters, log copying, and event rendering.
18. **SamplePicker Unit Test Suite**: Created `SamplePicker.test.tsx` verifying category grouping, manifest loading, and dynamic select updates.
19. **CanvasToolbar Unit Test Suite**: Created `CanvasToolbar.test.tsx` testing fit view, zoom in, zoom out, and animation reset triggers.
20. **QuizModal Unit Test Suite**: Created `QuizModal.test.tsx` testing the assessment workflow, scoring calculations, and answer review panel.
21. **Context-Aware Autocomplete Token Slicer**: Refactored `k8sCompletionSource` in `k8s-autocomplete.ts` to compute exact character replacement ranges for keys and values.
22. **Modifier Key Guard in Keyboard Shortcuts**: Updated `useKeyboardShortcuts.ts` to guard against modifier combinations (`ctrlKey`, `altKey`, `metaKey`) for clean browser shortcut interoperability.
23. **Stateful Tab Routing for Export and Share Modal**: Enhanced `ExportModal.tsx` to accept and synchronize `initialTab` (`'link' | 'mermaid' | 'svg'`) across open states.
24. **Immediate Reactive Failure State Dispatch**: Refactored `loadScenario` and `resetScenario` in `store/index.ts` to compute and dispatch active failure node/edge highlights on mount.
25. **Accessible Interactive Step Cards**: Refactored `StepDetail.tsx` into a keyboard-accessible interactive card component with `role="button"`, `tabIndex={0}`, and `aria-current`.
26. **Complete Scenario State Announcement Engine**: Extended `LiveRegion.tsx` to announce `failed`, `fixing`, `resolved`, and `completed` scenario state transitions.
27. **Expanded Autocomplete Test Suite**: Expanded `k8s-autocomplete.test.ts` to test completion range calculations, value insertion after colons, and comment handling.
28. **LiveRegion Accessibility Test Suite**: Expanded `LiveRegion.test.tsx` verifying screen reader announcements across all lifecycle steps and scenario states.
29. **ExportModal Tab Routing Test Suite**: Expanded `ExportModal.test.tsx` testing `initialTab` routing for both Share and Export actions.
30. **ValidationPanel Unit Test Suite**: Created `ValidationPanel.test.tsx` verifying error listing, line number badges, and collapse/expand toggling.
31. **Robust Multi-Doc Parser Filtering**: Hardened `multi-doc.ts` to ignore leading, trailing, and consecutive document boundary markers (`---` and `...`).
32. **Mermaid Syntax Escaping Pipeline**: Added comprehensive label sanitization in `export-utils.ts` for safe sequence and flowchart rendering.
33. **Responsive Canvas Control Layout**: Clean coordinate separation between canvas controls, toolbar, minimap, and legend.
34. **Collapsible What-If Controller Architecture**: Stateful minimize and restore hooks in `WhatIfPanel.tsx`.
35. **Scenario Search Empty State Engine**: Dynamic empty state handling with filter reset actions in `ScenarioList.tsx`.
36. **Complete Edge Style Registry in Legend**: Full sync between `FlowEdge` CSS classes and `DiagramLegend` visualization elements.
37. **Multi-Doc Splitter Test Suite**: Expanded tests in `yaml-parser.test.ts` testing leading, trailing, and consecutive delimiters.
38. **ScenarioList Empty State Test Suite**: Added unit tests in `ScenarioList.test.tsx` verifying empty search results and filter reset triggers.
39. **WhatIfPanel Minimization Test Suite**: Updated `WhatIfPanel.test.tsx` testing the minimize/expand toggle and scenario selection.
40. **DiagramLegend Full Styles Test Suite**: Updated `DiagramLegend.test.tsx` verifying all node statuses, edge statuses (including error and warning), and zone boundaries.

---

## 3. UX/UI Feature Enhancements (40 Improvements)

1. **Dual Right-Panel Navigation**: Switch between "Lifecycle Trace" and "Diagnostic Logs & Events" tabs with badge counters.
2. **Scenario Victory Card**: Interactive celebration banner displaying congratulations, resolution details, and a "Complete Challenge" button.
3. **One-Click Scenario Starter**: "Start Scenario" in the scenario briefing automatically loads broken manifests and switches the user to the Editor.
4. **Clickable Step Scrubbing**: Click any step dot on the animation timeline to instantly jump to that step.
5. **Floating Canvas Action Toolbar**: Glassmorphic canvas toolbar with Fit View, Zoom In, Zoom Out, and Reset buttons.
6. **Keyboard Shortcuts Help Dialog**: Modal showing visual keycap badges for Space, Arrow keys, Home, End, Escape, and ? keys.
7. **One-Click Code and Command Copy**: Added copy buttons with visual feedback to all terminal commands, logs, and YAML samples.
8. **Refined Dark and Light Color Palette**: High-contrast syntax highlighting, vibrant status indicators (Green, Yellow, Red, Sky Blue), and clean border styling.
9. **Responsive Canvas Panel Layout**: Optimized panel proportions, scroll boundaries, and flexible layout for different screen sizes.
10. **Rich Diagnostic Console**: Filterable logs with timestamp tags, log level color badges (Error, Warn, Info), and tabular event details.
11. **Live Search Filter for Diagnostics**: Search input to filter diagnostic events and log streams by component, reason, or error message.
12. **1-Click Copy All Container Logs**: Dedicated button in the container log terminal with animated checkmark feedback.
13. **Individual Copy Buttons for Debug Commands**: Fast copy actions on each CLI command in the Component Inspector drawer.
14. **Pulsing Flow Edge Error Markers**: Animated red and amber packet dots along failure communication paths.
15. **High-Contrast Flow Edge Labels**: Colored status badges with subtle background tinting on active, error, and warning edges.
16. **Scenario Category Badge Counters**: Category pills in `ScenarioList` showing the exact number of scenarios available per category.
17. **Active Scenario Glowing Indicator**: Clear badge on scenario cards indicating which challenge is currently active in the cluster.
18. **Interactive Quiz Answer Review**: Detailed review section displaying user choices, correct answers, and architectural explanations.
19. **Live Search Filter for Kubernetes Concepts**: Instant keyword search for architectural components and concepts in the Concepts tab.
20. **Complete JSON Diagram Export**: Option to export and download the complete diagram, manifest, and step trace as formatted JSON.
21. **Direct Modal Tab Routing**: Clicking "Share" opens the URL link tab directly; clicking "Export" opens the file download tab directly.
22. **Interactive Explanation Step Jumping**: Click any step card in the right-side lifecycle trace to smoothly jump to that step on the diagram canvas.
23. **Scenario Completion Dismiss Action**: Added a "Close Banner & View Diagram" action to clear the overlay and let users inspect the final resolved cluster state.
24. **Instant Visual Failure Lighting**: When a scenario loads, the failing node immediately pulses red with error indicators on the canvas.
25. **Speed Adjustment Keyboard Shortcuts**: Added `[` and `]` keyboard shortcuts to decrease/increase playback speed (0.5x, 1x, 2x, 3x) and `R` to reset animation.
26. **Dynamic Time-to-Solve and Category Badges**: Added estimated time badges (`~2-3 mins`, `~3-5 mins`) and difficulty tags on Scenario Detail views.
27. **Collapsible Validation Panel**: Added expand/collapse toggle and clean line number badges in the YAML Validation Issues panel.
28. **High-Contrast Active Step Borders**: Distinct glowing cyan border and active clock badge on currently executing lifecycle step cards.
29. **Animated Reset and Speed Controls**: Visual feedback on playback speed dropdown and reset buttons in the animation controller.
30. **Complete Keyboard Shortcuts Reference**: Updated keyboard shortcuts reference documenting `[` / `]`, `R`, `?`, `Space`, `Arrows`, and step card clicks.
31. **Coordinated Canvas Controls Header**: Canvas toolbar and legend positioned side-by-side without overlap for clean top-right canvas visibility.
32. **Complete Visual Edge Legend**: Legend now displays active (sky blue), completed (green), error (red dashed), and warning (amber dashed) edge flows.
33. **Interactive Search Empty State**: Clear empty search illustration and 1-click "Reset Search & Filters" button in `ScenarioList`.
34. **Minimizable What-If Simulator Card**: Minimize button on What-If panel so users can inspect the full failing cluster while retaining the active simulation.
35. **1-Click Clear Search in Scenario Browser**: Quick clear `X` icon inside the search input to wipe search terms instantly.
36. **Component Inspector Generic Fallback**: Clear guidance in inspector drawer when inspecting standard cluster nodes.
37. **Zero-Division Safe Progress Bar**: Dynamic progress bar with clean percentage clamping and rounded corners.
38. **Safe UTF-8 File Downloads**: Exported YAML, Mermaid, and JSON files save with explicit UTF-8 charset declarations.
39. **Smooth Collapsible Transition in What-If**: Smooth slide and fade transitions when toggling What-If panel height.
40. **High-Contrast Failure Edge Legends**: Clear red and amber preview lines in the legend card.
