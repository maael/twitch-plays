import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { FaPlusSquare as PlusIco } from 'react-icons/fa'
import { v4 } from 'uuid'

export interface ControlConfig {
  id: string
  name: string
  readableScript: string
  script: string
  command: string
  team?: string
}

export default function ControlsConfigScreen({
  controls,
  setControls,
}: {
  controls: ControlConfig[]
  setControls: Dispatch<SetStateAction<ControlConfig[]>>
}) {
  return (
    <div>
      <h2>
        {controls.length} Control{controls.length === 1 ? '' : 's'}
      </h2>
      <div className="flex flex-col gap-3 mt-2">
        <div className="grid grid-cols-4 gap-2 border-b border-gray-700 pb-1 px-1">
          <span>Name</span>
          <span>Chat Command</span>
          <span>Action</span>
          <span>Team</span>
        </div>
        {controls.map((c) => (
          <ControlRow
            key={c.id}
            config={c}
            onUpdate={(item) => {
              const idx = controls.findIndex(({ id }) => id === item.id)
              const updated = controls
                .slice(0, idx)
                .concat(item)
                .concat(controls.slice(idx + 1))
              setControls(updated)
            }}
          />
        ))}
        <button
          className="flex justify-center items-center py-2 w-full transform hover:translate-y-1 transition-transform"
          onClick={() =>
            setControls((c) => c.concat([{ id: v4(), name: '', readableScript: '', script: '', command: '' }]))
          }
        >
          <PlusIco />
        </button>
      </div>
    </div>
  )
}

function ControlRow({ config, onUpdate }: { config: ControlConfig; onUpdate: (update: ControlConfig) => void }) {
  const [item, setItem] = React.useState(config)
  const { name: actionName, command, readableScript, script: _script, team } = item
  useEffect(() => {
    onUpdate(item)
  }, [item])
  return (
    <div className="grid grid-cols-4 gap-2">
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Command Name"
        value={actionName}
        onChange={(e) => setItem((i) => ({ ...i, name: e.target.value }))}
      />
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Chat Command"
        value={command}
        onChange={(e) => setItem((i) => ({ ...i, command: e.target.value }))}
      />
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Action"
        value={readableScript}
        onChange={(e) => setItem((i) => ({ ...i, readableScript: e.target.value }))}
      />
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Team"
        value={team || 'Default'}
        onChange={(e) => setItem((i) => ({ ...i, team: e.target.value }))}
      />
    </div>
  )
}
