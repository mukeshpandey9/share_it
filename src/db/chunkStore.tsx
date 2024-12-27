import {create} from 'zustand';
import {Buffer} from 'buffer';

interface ChunkState {
  chunkStore: {
    id: string | null;
    name: string;
    totalChunks: number;
    chunkArray: Buffer[];
  } | null;
  currentChunkSet: {
    id: string | null;
    totalChunks: number;
    chunkArray: Buffer[];
  } | null;

  setChunkStorage: (chunkStore: any) => void;
  resetChunkStorage: () => void;
  setCurrentChunkSet: (chunkChunkSet: any) => void;
  resetCurrentChunkSet: () => void;
}

export const useChunkStore = create<ChunkState>(set => ({
  chunkStore: null,
  currentChunkSet: null,
  setChunkStorage: chunkStore => set(() => ({chunkStore})),
  setCurrentChunkSet: currentChunkSet => set(() => ({currentChunkSet})),
  resetChunkStorage: () => set(() => ({chunkStore: null})),
  resetCurrentChunkSet: () => set(() => ({currentChunkSet: null})),
}));
