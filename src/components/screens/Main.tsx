import React from 'react'
import { FaArrowRight as RightIco } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { ChatItem } from '../../chat'

export default function MainScreen({ chatEvents, lastAction }: { chatEvents: ChatItem[]; lastAction: string | null }) {
  return (
    <>
      <div className="grid gap-2 grid-cols-2 mt-3">
        <div className="px-3 py-1 rounded-md text-center">Controls: VVVVV</div>
        <div className="px-3 py-1 rounded-md text-center">Audience: 50/50</div>
      </div>
      <div className="grid gap-2 grid-cols-2 mt-3">
        <Link to="/config/controls">
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer">
            <div className="flex-1">Control Configurations</div>
            <RightIco />
          </div>
        </Link>
        <Link to="/config/audience">
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer">
            <div className="flex-1">Audience Configuration</div>
            <RightIco />
          </div>
        </Link>
      </div>
      <div className="mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-gray-600 absolute top-0 right-0 left-0 h-8 flex justify-between px-10 items-center text-white">
          <div>Last action: {lastAction || 'None'}</div>
          <div>
            {chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="bg-gray-300 absolute top-8 right-0 left-0 h-2 shadow-md">
          <div className="bg-purple-600 h-full transition-all" style={{ width: '30%' }} />
        </div>
        <div className="relative flex-1">
          {chatEvents.length === 0 ? (
            <span className="relative top-12 left-2">Logs will appear here...</span>
          ) : (
            <div className="absolute top-10 right-0 left-0 bottom-0 overflow-y-scroll px-2 py-3 flex flex-col gap-1">
              {chatEvents.map((c) => {
                return (
                  <div key={c.id}>
                    <span className="rounded-full bg-purple-700 h-4 w-4 inline-block mr-1">
                      <span className="flex justify-center items-center text-xs" title={`Team: ${'Default'}`}>
                        D
                      </span>
                    </span>
                    <span style={{ color: c.color }}>[{c.displayName}]</span> {c.msg}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
