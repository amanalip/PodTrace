import React, { useState } from 'react';
import { Terminal, ListFilter, Activity } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './DiagnosticLogPanel.module.css';

export const DiagnosticLogPanel: React.FC = () => {
  const { activeScenario, scenarioState } = useAppStore();
  const [activeTab, setActiveTab] = useState<'events' | 'logs' | 'conditions'>('events');

  if (!activeScenario) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          No active scenario loaded. Select a scenario from the sidebar to inspect diagnostic logs.
        </div>
      </div>
    );
  }

  const { logs, events } = activeScenario.failureDetails;
  const isFailed = scenarioState === 'failed' || scenarioState === 'fixing';

  return (
    <div className={styles.container} data-testid="diagnostic-log-panel">
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <ListFilter size={14} />
          <span>Events (kubectl describe)</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={14} />
          <span>Logs (kubectl logs)</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'conditions' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          <Activity size={14} />
          <span>Conditions</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'events' && (
          <div className={styles.tableWrapper}>
            {events.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>
                No events recorded.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Age</th>
                    <th>From</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          className={
                            evt.type === 'Warning' ? styles.badgeWarning : styles.badgeNormal
                          }
                        >
                          {evt.type}
                        </span>
                      </td>
                      <td>{evt.reason}</td>
                      <td style={{ color: '#94a3b8' }}>{evt.age}</td>
                      <td style={{ color: '#38bdf8' }}>{evt.from}</td>
                      <td>{evt.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className={styles.logTerminal}>
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>
                No container log output available.
              </div>
            ) : (
              logs.map((log, idx) => {
                const msgClass =
                  log.level === 'error'
                    ? styles.logMsg_error
                    : log.level === 'warn'
                      ? styles.logMsg_warn
                      : styles.logMsg_info;

                return (
                  <div key={idx} className={styles.logLine}>
                    <span className={styles.logTime}>[{log.timestamp}]</span>
                    <span className={styles.logComponent}>[{log.component}]</span>
                    <span className={msgClass}>{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className={styles.conditionsList}>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>PodScheduled</span>
              <span className={styles.badgeNormal}>True</span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>Initialized</span>
              <span className={styles.badgeNormal}>True</span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>ContainersReady</span>
              <span className={isFailed ? styles.badgeWarning : styles.badgeNormal}>
                {isFailed ? 'False' : 'True'}
              </span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>Ready</span>
              <span className={isFailed ? styles.badgeWarning : styles.badgeNormal}>
                {isFailed ? 'False' : 'True'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
