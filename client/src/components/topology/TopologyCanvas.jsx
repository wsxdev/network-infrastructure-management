import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { Layers, Info } from 'lucide-react';

const nodeTypes = {
  customDeviceNode: CustomNode
};

export function TopologyCanvas({
  initialNodes = [],
  initialEdges = [],
  onSelectDevice
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = (event, node) => {
    if (onSelectDevice) {
      onSelectDevice(node.data);
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#cbd5e1" gap={18} size={1} />
        <Controls className="bg-white border border-slate-200 shadow-xs rounded-lg" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data?.status) {
              case 'up':
                return '#10B981';
              case 'down':
                return '#EF4444';
              case 'unreachable':
                return '#F59E0B';
              default:
                return '#94A3B8';
            }
          }}
          className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs"
        />
      </ReactFlow>

      {/* Convención Topológica Flotante */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 text-xs shadow-sm space-y-2 pointer-events-auto">
        <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
          Convención de Enlaces
        </span>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-mineral-green-700 inline-block" />
          <span className="text-slate-600">Enlace Confirmado (Físico)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 border-b-2 border-dashed border-mineral-green-400 inline-block" />
          <span className="text-slate-600">Enlace Inferido (Lógico)</span>
        </div>
      </div>
    </div>
  );
}
