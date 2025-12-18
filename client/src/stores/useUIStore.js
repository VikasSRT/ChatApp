// src/stores/useUIStore.js
import { create } from "zustand";

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (value) => set({ sidebarOpen: value }),

  isAnonymous: false,
  setIsAnonymous: (value) => set({ isAnonymous: value }),

  showGroupModal: false,
  setShowGroupModal: (value) => set({ showGroupModal: value }),
  toggleGroupModal: () =>
    set((state) => ({ showGroupModal: !state.showGroupModal })),
}));

export default useUIStore;
