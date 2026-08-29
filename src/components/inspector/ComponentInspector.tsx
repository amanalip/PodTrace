import React, { useState } from 'react';
import { X, ExternalLink, Terminal, Activity, Settings, Info, Copy, Check } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import { getComponentInspectionData } from '../../inspector/component-inspector-data.ts';
import styles from './ComponentInspector.module.css';

export const ComponentInspector: React.FC = () => {
  const { selectedNodeId, setSelectedNodeId, nodes } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'metrics' | 'debug'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!selectedNodeId) return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  // Resolve component inspection metadata
  const nodeLabel = ((selectedNode.data as Record<string, unknown> | undefined)?.label as string) || selectedNode.id;
  const info =
    getComponentInspectionData(selectedNode.type || '') ||
    getComponentInspectionData(selectedNode.id) || {
      id: selectedNode.id,
      name: nodeLabel,
      role: 'Cluster Architecture Component',
      zone: selectedNode.type?.includes('Zone') ? 'Logical Boundary' : 'Cluster Topology',
      binary: selectedNode.type || 'Kubernetes Resource',
      responsibilities: [
        `Configured element with node ID "${selectedNode.id}".`,
        'Maintains cluster topological state and lifecycle synchronization.',
      ],
      configFlags: [],
      metrics: [],
      failureModes: [],
      debugCommands: [`kubectl get ${selectedNode.id}`, `kubectl describe ${selectedNode.id}`],
      githubUrl: '',
    };

  const details = (selectedNode.data as Record<string, unknown> | undefined)?.details as
    | { containers?: Array<{ name: string; image?: string }> }
    | undefined;

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className={styles.drawer} data-testid="component-inspector">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.name}>{info.name}</div>
          <div className={styles.role}>{info.role} • {info.zone}</div>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setSelectedNodeId(null)}
          aria-label="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
          Overview
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'flags' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('flags')}
        >
          <Settings size={12} style={{ display: 'inline', marginRight: 4 }} />
          Flags
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'metrics' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
          Metrics
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'debug' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('debug')}
        >
          <Terminal size={12} style={{ display: 'inline', marginRight: 4 }} />
          Debug
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <>
            <div>
              <div className={styles.sectionTitle}>Key Responsibilities</div>
              <ul className={styles.list}>
                {info.responsibilities.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
            {details?.containers && details.containers.length > 0 && (
              <div>
                <div className={styles.sectionTitle}>Containers in Pod</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {details.containers.map((c, idx) => (
                    <div key={idx} className={styles.flagCard}>
                      <span className={styles.flagName}>{c.name}</span>
                      {c.image && <span className={styles.flagDesc}>Image: {c.image}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className={styles.sectionTitle}>Binary Name</div>
              <div className={styles.cmdBox}>{info.binary}</div>
            </div>
          </>
        )}

        {activeTab === 'flags' && (
          <div>
            <div className={styles.sectionTitle}>Key Configuration Flags</div>
            {info.configFlags.length === 0 ? (
              <div style={{ color: '#64748b' }}>No CLI flags defined for this component.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {info.configFlags.map((f, idx) => (
                  <div key={idx} className={styles.flagCard}>
                    <span className={styles.flagName}>{f.flag}</span>
                    <span className={styles.flagDesc}>{f.description}</span>
                    {f.defaultValue && (
                      <span className={styles.flagDefault}>Default: {f.defaultValue}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div>
            <div className={styles.sectionTitle}>Prometheus Metrics</div>
            {info.metrics.length === 0 ? (
              <div style={{ color: '#64748b' }}>No direct Prometheus metrics registered.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {info.metrics.map((m, idx) => (
                  <div key={idx} className={styles.flagCard}>
                    <div className={styles.metricRow}>
                      <span className={styles.metricName}>{m.name}</span>
                      <span className={styles.metricType}>{m.type}</span>
                    </div>
                    <span className={styles.flagDesc}>{m.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'debug' && (
          <>
            <div>
              <div className={styles.sectionTitle}>Common Failure Modes</div>
              {info.failureModes.length === 0 ? (
                <div style={{ color: '#64748b' }}>No common failure modes recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {info.failureModes.map((fm, idx) => (
                    <div key={idx} className={styles.flagCard}>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{fm.issue}</span>
                      {fm.resolution && <span className={styles.flagDesc}>Fix: {fm.resolution}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className={styles.sectionTitle}>Diagnostic Commands</div>
              {info.debugCommands.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: 11 }}>
                  Standard kubectl get and describe commands apply to this component.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {info.debugCommands.map((cmd, idx) => (
                    <div key={idx} className={styles.cmdRow}>
                      <div className={styles.cmdBox}>{cmd}</div>
                      <button
                        type="button"
                        className={styles.copyCmdBtn}
                        onClick={() => handleCopyCommand(cmd, idx)}
                        title="Copy command to clipboard"
                        aria-label={`Copy ${cmd}`}
                      >
                        {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {info.githubUrl && (
          <a
            href={info.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <span>Source Code on GitHub</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};
