export interface DocChunk {
  raw: string;
  startLine: number;
  endLine: number;
}

export function splitMultiDocYaml(rawYaml: string): DocChunk[] {
  const lines = rawYaml.split(/\r?\n/);
  const chunks: DocChunk[] = [];
  let currentChunkLines: string[] = [];
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSeparator = /^---\s*$/.test(line);

    if (isSeparator) {
      if (currentChunkLines.length > 0) {
        const raw = currentChunkLines.join('\n');
        if (raw.trim().length > 0) {
          chunks.push({
            raw,
            startLine,
            endLine: i,
          });
        }
      }
      currentChunkLines = [];
      startLine = i + 2; // Next line after '---' (1-indexed)
    } else {
      currentChunkLines.push(line);
    }
  }

  if (currentChunkLines.length > 0) {
    const raw = currentChunkLines.join('\n');
    if (raw.trim().length > 0) {
      chunks.push({
        raw,
        startLine,
        endLine: lines.length,
      });
    }
  }

  return chunks;
}
