import { Handle, Position } from '@xyflow/react';

export default function OrNode({ data }: { data: { label: string } }) {
  return (
    <div
      style={{
        border: '2px dashed black',
        fontSize: '20px',
        fontWeight: 'bold',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: 'white',
      }}
    >
      <Handle type="target" position={Position.Top} id="top-target" />
      {data.label}
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
    </div>
  );
} 