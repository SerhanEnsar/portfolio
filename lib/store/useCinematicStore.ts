import { create } from 'zustand';

interface CinematicState {
  isOpen: boolean;
  currentScene: number;
  isWaitingForAction: boolean;
  isIdleLooping: boolean;
  isFinished: boolean;
  openCinematic: () => void;
  closeCinematic: () => void;
  advanceScene: () => void;
  setWaitingForAction: (waiting: boolean) => void;
  setIdleLooping: (looping: boolean) => void;
  setFinished: (finished: boolean) => void;
}

export const useCinematicStore = create<CinematicState>((set) => ({
  isOpen: false,
  currentScene: 1,
  isWaitingForAction: false,
  isIdleLooping: true,
  isFinished: false,

  openCinematic: () =>
    set({
      isOpen: true,
      currentScene: 1,
      isWaitingForAction: false,
      isIdleLooping: true,
      isFinished: false,
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

  setFinished: (finished) =>
    set({
      isFinished: finished,
    }),
}));
