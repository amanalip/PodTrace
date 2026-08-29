import React from 'react';
import { SAMPLE_LIBRARY, SampleManifest } from '../../samples/sample-library.ts';
import { useAppStore } from '../../store/index.ts';
import styles from './SamplePicker.module.css';

const CATEGORIES: SampleManifest['category'][] = [
  'Basics',
  'Workloads',
  'Networking',
  'Config',
  'Scaling',
  'Full stack',
];

export const SamplePicker: React.FC = () => {
  const { yaml, setYaml } = useAppStore();

  // Find matching sample if current YAML matches exactly
  const currentSample = SAMPLE_LIBRARY.find((s) => s.yaml.trim() === yaml?.trim());
  const selectedValue = currentSample ? currentSample.id : '';

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const sample = SAMPLE_LIBRARY.find((s) => s.id === id);
    if (sample) {
      setYaml(sample.yaml);
    }
  };

  return (
    <div className={styles.samplePickerContainer}>
      <select
        className={styles.select}
        value={selectedValue}
        onChange={handleSelect}
        aria-label="Select sample manifest"
        title="Load a sample Kubernetes manifest"
        data-testid="sample-picker-select"
      >
        <option value="" disabled>
          Load Sample Manifest...
        </option>
        {CATEGORIES.map((cat) => {
          const samplesInCat = SAMPLE_LIBRARY.filter((s) => s.category === cat);
          if (samplesInCat.length === 0) return null;
          return (
            <optgroup key={cat} label={cat}>
              {samplesInCat.map((s) => (
                <option key={s.id} value={s.id} title={s.description}>
                  {s.name} ({s.category})
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
};
