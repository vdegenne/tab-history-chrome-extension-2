import {LocalStorage, SyncStorage} from '@vdegenne/chrome-extension/storage.js'

// No need to use "?"
interface SyncDataStructure {}

interface LocalDataStructure {}

export const syncData = new SyncStorage<SyncDataStructure>()
export const localData = new LocalStorage<LocalDataStructure>()

export const DEFAULT_OPTIONS: SyncDataStructure = {}
