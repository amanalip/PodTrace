import React, { useState, useMemo } from 'react';
import { Terminal, ListFilter, Activity, Search, Copy, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/index.ts';
import styles from './DiagnosticLogPanel.module.css';

export const DiagnosticLogPanel: React.FC = () => {
  const { activeScenario, scenarioState } = useAppStore();
  const [activeTab, setActiveTab] = useState<'events' | 'logs' | 'conditions'>('events');
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedEvents, setCopiedEvents] = useState(false);

  const failureDetails = activeScenario?.failureDetails;
  const isFailed = scenarioState === 'failed' || scenarioState === 'fixing';

  const filteredEvents = useMemo(() => {
    if (!failureDetails?.events) return [];
    if (!filterQuery.trim()) return failureDetails.events;
    const q = filterQuery.toLowerCase();
    return failureDetails.events.filter(
      (e) =>
        e.type.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q),
    );
  }, [failureDetails?.events, filterQuery]);

  const filteredLogs = useMemo(() => {
    if (!failureDetails?.logs) return [];
    if (!filterQuery.trim()) return failureDetails.logs;
    const q = filterQuery.toLowerCase();
    return failureDetails.logs.filter(
      (l) =>
        l.message.toLowerCase().includes(q) ||
        l.component.toLowerCase().includes(q) ||
        l.level.toLowerCase().includes(q),
    );
  }, [failureDetails?.logs, filterQuery]);

  if (!activeScenario || !failureDetails) {
    return (
      <div className={styles.container} role="status">
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          No active scenario loaded. Select a scenario from the sidebar to inspect diagnostic logs.
        </div>
      </div>
    );
  }

  const handleCopyLogs = () => {
    const text = failureDetails.logs
      .map((l) => `[${l.timestamp}] [${l.component}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyEvents = () => {
    const text = failureDetails.events
      .map((e) => `[${e.type}] [${e.reason}] [${e.from}] (Age: ${e.age}) ${e.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedEvents(true);
    setTimeout(() => setCopiedEvents(false), 2000);
  };

  const isSchedulingFailed = isFailed && (
    activeScenario.id === 'pending-cpu' ||
    activeScenario.id === 'unschedulable-taint' ||
    activeScenario.id === 'affinity-conflict' ||
    activeScenario.id === 'pvc-pending'
  );

  const isInitFailed = isFailed && activeScenario.id === 'init-container-fail';

  const podScheduledTrue = !isSchedulingFailed;
  const initializedTrue = !isInitFailed && !isSchedulingFailed;
  const containersReadyTrue = !isFailed;
  const readyTrue = !isFailed;

  return (
    <div className={styles.container} data-testid="diagnostic-log-panel">
      <div className={styles.tabs} role="tablist" aria-label="Diagnostic views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'events'}
          aria-controls="diagnostic-tab-content"
          className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <ListFilter size={14} />
          <span>Events ({failureDetails.events.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'logs'}
          aria-controls="diagnostic-tab-content"
          className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={14} />
          <span>Logs ({failureDetails.logs.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'conditions'}
          aria-controls="diagnostic-tab-content"
          className={`${styles.tabBtn} ${activeTab === 'conditions' ? styles.tabBtn_active : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          <Activity size={14} />
          <span>Conditions</span>
        </button>
      </div>

      <div className={styles.subToolbar}>
        <div className={styles.searchBox}>
          <Search size={12} color="#64748b" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filter events & logs..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            data-testid="diag-filter-input"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Clear diagnostic filter"
              data-testid="clear-diag-search-icon"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {activeTab === 'events' && failureDetails.events.length > 0 && (
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopyEvents}
            title="Copy diagnostic events to clipboard"
            aria-label="Copy diagnostic events"
            aria-live="polite"
            data-testid="copy-all-events-btn"
          >
            {copiedEvents ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedEvents ? 'Copied' : 'Copy Events'}</span>
          </button>
        )}

        {activeTab === 'logs' && failureDetails.logs.length > 0 && (
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopyLogs}
            title="Copy container logs to clipboard"
            aria-label="Copy all container logs"
            aria-live="polite"
            data-testid="copy-all-logs-btn"
          >
            {copiedAll ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
          </button>
        )}
      </div>

      <div id="diagnostic-tab-content" role="tabpanel" className={styles.content}>
        {activeTab === 'events' && (
          <div className={styles.tableWrapper}>
            {filteredEvents.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>
                <div>{filterQuery ? 'No events matching search filter.' : 'No events recorded.'}</div>
                {filterQuery && (
                  <button
                    type="button"
                    style={{
                      marginTop: 8,
                      padding: '4px 8px',
                      background: 'var(--bg-tertiary, #1e293b)',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: 4,
                      color: '#38bdf8',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                    onClick={() => setFilterQuery('')}
                    data-testid="clear-diag-filter-btn"
                  >
                    Clear filter
                  </button>
                )}
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
                  {filteredEvents.map((evt, idx) => (
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
          <div className={styles.logTerminal} data-testid="log-terminal">
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>
                <div>{filterQuery ? 'No logs matching search filter.' : 'No container log output available.'}</div>
                {filterQuery && (
                  <button
                    type="button"
                    style={{
                      marginTop: 8,
                      padding: '4px 8px',
                      background: 'var(--bg-tertiary, #1e293b)',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: 4,
                      color: '#38bdf8',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                    onClick={() => setFilterQuery('')}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
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
              <span className={podScheduledTrue ? styles.badgeNormal : styles.badgeWarning}>
                {podScheduledTrue ? 'True' : 'False'}
              </span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>Initialized</span>
              <span className={initializedTrue ? styles.badgeNormal : styles.badgeWarning}>
                {initializedTrue ? 'True' : 'False'}
              </span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>ContainersReady</span>
              <span className={containersReadyTrue ? styles.badgeNormal : styles.badgeWarning}>
                {containersReadyTrue ? 'True' : 'False'}
              </span>
            </div>
            <div className={styles.conditionRow}>
              <span className={styles.conditionName}>Ready</span>
              <span className={readyTrue ? styles.badgeNormal : styles.badgeWarning}>
                {readyTrue ? 'True' : 'False'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
