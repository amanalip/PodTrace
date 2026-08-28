import { Node } from '@xyflow/react';

export function positionInsideZone(
  nodeIndex: number,
  totalNodesInRow = 3,
  startX = 30,
  startY = 60,
  gapX = 200,
  gapY = 90,
): { x: number; y: number } {
  const col = nodeIndex % totalNodesInRow;
  const row = Math.floor(nodeIndex / totalNodesInRow);
  return {
    x: startX + col * gapX,
    y: startY + row * gapY,
  };
}

export function arrangeNodesInZones(nodes: Node[]): Node[] {
  return nodes;
}
