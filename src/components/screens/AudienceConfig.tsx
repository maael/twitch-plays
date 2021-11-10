import React from 'react'

export default function AudienceConfigScreen() {
  return (
    <div>
      <h2 className="text-lg">Audience Settings</h2>
      <div className="flex flex-col gap-2">
        <label className="flex flex-row gap-2 items-center">
          <input type="checkbox" />
          Subscriber only?
        </label>
        <input className="bg-gray-700 px-2 py-1" placeholder="Number of Groups" />
        <h3 className="mt-3">Split Method</h3>
        <div className="grid gap-2 grid-cols-3 mt-1">
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center">
            Random
          </div>
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center">
            Alphabet
          </div>
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center">
            Subscriber Status
          </div>
        </div>
      </div>
    </div>
  )
}
