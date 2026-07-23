import { create } from 'zustand';

interface CinematicState {
  isOpen: boolean;
  currentScene: number;
  isWaitingForAction: boolean;
  isIdleLooping: boolean;
  openCinematic: () => void;
  closeCinematic: () => void;
  advanceScene: () => void;
  setWaitingForAction: (waiting: boolean) => void;
  setIdleLooping: (looping: boolean) => void;
}

export const useCinematicStore = create<CinematicState>((set) => ({
  isOpen: false,
  currentScene: 1,
  isWaitingForAction: false,
  isIdleLooping: true,

  openCinematic: () =>
    set({
      isOpen: true,
      currentScene: 1,
      isWaitingForAction: false,
      isIdleLooping: true,
    }),

  closeCinematic: () =>
    set({
      isOpen: false,
    }),

  advanceScene: () =>
    set((state) => ({
      currentScene: Math.min(state.currentScene + 1, 7),
      isWaitingForAction: false,
      isIdleLooping: false,
    })),

  setWaitingForAction: (waiting) =>
    set({
      isWaitingForAction: waiting,
    }),

  setIdleLooping: (looping) =>
    set({
      isIdleLooping: looping,
    }),
}));
