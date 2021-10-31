import React from 'react'
import { FaTwitch as TwitchIco, FaArrowRight as RightIco, FaPlusSquare as PlusIco } from 'react-icons/fa'
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import chat from './chat';

export default function App() {
  const [channel, setChannel] = React.useState('');
  React.useEffect(() => {
    const client = chat(channel);
    return () => {
      client.disconnect()
    }
  }, [channel])
  return (
    <Router initialEntries={['/']}>
      <div className='flex flex-row justify-start'>
        <div className='flex-1'>
          <Link to='/'>
            <h1 className='text-xl flex flex-row gap-2 items-center text-purple-400'><TwitchIco /> Twitch Plays</h1>
          </Link>
        </div>
        <input className='bg-gray-700 px-2 py-1' placeholder='Channel Name' value={channel} onChange={(e) => setChannel(e.target.value)} />
        <button className='bg-purple-600 text-white py-1 px-3 rounded-sm transform hover:translate-y-1 transition-transform shadow-md flex flex-row items-center gap-2'><TwitchIco /> Twitch Login</button>
      </div>
      <Switch>
        <Route path='/config/audience'>
          <AudienceConfigScreen />
        </Route>
        <Route path='/config/controls'>
          <ControlsConfigScreen />
        </Route>
        <Route path='/'>
          <MainScreen />
        </Route>
      </Switch>
    </Router>
  )
}

function MainScreen() {
  return (
    <>
      <div className='grid gap-2 grid-cols-2 mt-3'>
        <div className='px-3 py-1 rounded-md text-center'>Controls: VVVVV</div>
        <div className='px-3 py-1 rounded-md text-center'>Audience: 50/50</div>
      </div>
      <div className='grid gap-2 grid-cols-2 mt-3'>
        <Link to='/config/controls'>
          <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer'>
            <div className='flex-1'>Control Configurations</div><RightIco /></div>
        </Link>
        <Link to='/config/audience'>
          <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer'>
            <div className='flex-1'>Audience Configuration</div><RightIco /></div>
        </Link>
      </div>
      <div className='bg-gray-700 rounded-md my-5 px-4 py-3 shadow-md flex-1'>
        Logs will appear here...
      </div>
    </>
  )
}

function ControlsConfigScreen() {
  const [controls, setControls] = React.useState([{ id: 1 }])
  return (
    <div>
      <h2>Controls</h2>
      <div className='flex flex-col gap-3 mt-2'>
        {controls.map((c) => (<ControlRow key={c.id} />))}
        <button className='flex justify-center items-center py-2 w-full transform hover:translate-y-1 transition-transform' onClick={() => setControls((c) => c.concat([{ id: c.length + 1 }]))}>
          <PlusIco />
        </button>
      </div>
    </div>
  )
}

function ControlRow() {
  return (
    <div className='flex flex-row gap-2'>
      <input className='bg-gray-700 px-2 py-1' placeholder='Control' />
      <input className='bg-gray-700 px-2 py-1' placeholder='Chat Command' />
      <input className='bg-gray-700 px-2 py-1' placeholder='Audience Group' />
    </div>
  )
}

function AudienceConfigScreen() {
  return (
    <div>
      <h2 className='text-lg'>Audience Settings</h2>
      <div className='flex flex-col gap-2'>
      <label className='flex flex-row gap-2 items-center'>
        <input type='checkbox' />
        Subscriber only?
      </label>
      <input className='bg-gray-700 px-2 py-1' placeholder='Number of Groups' />
      <h3 className='mt-3'>Split Method</h3>
      <div className='grid gap-2 grid-cols-3 mt-1'>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Random</div>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Alphabet</div>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Subscriber Status</div>
      </div>
      </div>
    </div>
  )
}