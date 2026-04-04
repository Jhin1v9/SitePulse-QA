/**
 * System Store - Zustand
 * Manages system state, clock, notifications, and global settings
 */

import { create } from 'zustand';
import type { AIState, Notification } from '@/types/os';

interface SystemStore {
  clock: Date;
  notifications: Notification[];
  aiState: AIState;
  aiMessage?: string;
  spotlightOpen: boolean;
  finderOpen: boolean;

  // Actions
  updateClock: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setAIState: (state: AIState) => void;
  setAIMessage: (message: string | undefined) => void;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;
  openFinder: () => void;
  closeFinder: () => void;
  toggleFinder: () => void;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  clock: new Date(),
  notifications: [],
  aiState: 'idle',
  aiMessage: undefined,
  spotlightOpen: false,
  finderOpen: false,

  updateClock: () => {
    set({ clock: new Date() });
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    set(state => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
    }));
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setAIState: (state: AIState) => {
    set({ aiState: state });
  },

  setAIMessage: (message: string | undefined) => {
    set({ aiMessage: message });
  },

  openSpotlight: () => {
    set({ spotlightOpen: true });
  },

  closeSpotlight: () => {
    set({ spotlightOpen: false });
  },

  toggleSpotlight: () => {
    set(state => ({ spotlightOpen: !state.spotlightOpen }));
  },

  openFinder: () => {
    set({ finderOpen: true });
  },

  closeFinder: () => {
    set({ finderOpen: false });
  },

  toggleFinder: () => {
    set(state => ({ finderOpen: !state.finderOpen }));
  },
}));
