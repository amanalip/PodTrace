import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightActiveLine, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { yaml } from '@codemirror/lang-yaml';
import { bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { linter, Diagnostic } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';
import jsyaml from 'js-yaml';
import { useAppStore } from '../../store/index.ts';
import { DEFAULT_SAMPLE_YAML } from '../../model/constants.ts';
import { FormatButton } from './FormatButton.tsx';
import { SamplePicker } from './SamplePicker.tsx';
import { k8sCompletionSource } from './k8s-autocomplete.ts';
import styles from './YAMLEditor.module.css';

const yamlLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc.toString();
  if (!doc.trim()) return diagnostics;

  try {
    jsyaml.loadAll(doc);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'mark' in err) {
      const mark = (err as { mark?: { line?: number; column?: number; position?: number }; reason?: string }).mark;
      const reason = (err as { reason?: string }).reason || 'YAML syntax error';
      if (mark && typeof mark.position === 'number') {
        const from = Math.min(mark.position, view.state.doc.length);
        const to = Math.min(from + 1, view.state.doc.length);
        diagnostics.push({
          from,
          to,
          severity: 'error',
          message: reason,
        });
      }
    }
  }
  return diagnostics;
});

const darkEditorTheme = EditorView.theme({
  '&': {
    color: '#f8fafc',
    backgroundColor: '#161e2b',
  },
  '.cm-content': {
    caretColor: '#38bdf8',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#38bdf8',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  '.cm-gutters': {
    backgroundColor: '#161e2b',
    color: '#64748b',
    borderRight: '1px solid #263447',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
});

export const YAMLEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalChangeRef = useRef(false);
  const { yaml: yamlContent, setYaml } = useAppStore();

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const initialContent = useAppStore.getState().yaml ?? DEFAULT_SAMPLE_YAML;

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        foldGutter(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        yaml(),
        yamlLinter,
        autocompletion({ override: [k8sCompletionSource] }),
        darkEditorTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            isInternalChangeRef.current = true;
            const newContent = update.state.doc.toString();
            setYaml(newContent);
            isInternalChangeRef.current = false;
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [setYaml]);

  // Sync external changes if changed from outside
  useEffect(() => {
    if (!viewRef.current || isInternalChangeRef.current) return;
    const currentDoc = viewRef.current.state.doc.toString();
    if (yamlContent !== undefined && yamlContent !== currentDoc) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: yamlContent,
        },
      });
    }
  }, [yamlContent]);

  const handleFormat = useCallback(() => {
    if (!viewRef.current) return;
    const currentDoc = viewRef.current.state.doc.toString();
    try {
      const parsed = jsyaml.loadAll(currentDoc);
      const formatted = parsed
        .map((doc) =>
          jsyaml.dump(doc, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
          }),
        )
        .join('---\n');

      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: formatted,
        },
      });
      setYaml(formatted);
    } catch {
      // If parsing fails due to syntax error, leave as is
    }
  }, [setYaml]);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>Manifest Source</span>
        <div className={styles.toolbarActions}>
          <SamplePicker />
          <FormatButton onFormat={handleFormat} />
        </div>
      </div>
      <div className={styles.codeArea} ref={editorRef} data-testid="yaml-editor-container" />
    </div>
  );
};
