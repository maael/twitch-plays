import {useState, useEffect, Dispatch, SetStateAction} from 'react'

export default function useStorage<T> (key: string, initialValue: T, onInit?: (value: T) => void): [T, Dispatch<SetStateAction<T>>, boolean] {
  const serialize = JSON.stringify;
  const deserialize = JSON.parse;
  const [state, setState] = useState<T>(initialValue);
  const [syncedState, setSyncedState] = useState<T>(state);
  const [initialised, setInitialised] = useState(false)
  useEffect(() => {
    const value = state;
    (async () => {
      if (syncedState === value) return
      try {
        console.info('[storage:set]', key, value)
        await Neutralino.storage.setData(key, serialize(value))
        setSyncedState(value)
      } catch (e) {
        console.warn('[storage:error]', e);
      }
    })()
  }, [state]);
  useEffect(() => {
    (async () => {
      let value = initialValue
      try {
        try {
          value = deserialize(await Neutralino.storage.getData(key))
        } catch (e) {
          console.warn('[storage:warn]', e);
        }
        setState(value)
        console.info('[storage:loaded]', key, value)
        try {
          await Neutralino.storage.setData(key, serialize(value))
        } catch (e) {
          console.warn('[storage:warn]', e);
        }
      } finally {
        if (onInit) onInit(value);
        setInitialised(true)
      }
    })()
  }, [key])
  return [state, setState, initialised];
}