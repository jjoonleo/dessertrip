"use client";

import { create } from "zustand";

type AuthStatus = "authenticated" | "unauthenticated";

export type AuthUiState = {
  status: AuthStatus;
  username: string;
  password: string;
  pending: boolean;
  error: string | null;
  hydrate: (status: AuthStatus) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
  markAuthenticated: () => void;
  markUnauthenticated: () => void;
  resetForm: () => void;
};

export const useAuthStore = create<AuthUiState>((set) => ({
  status: "unauthenticated",
  username: "",
  password: "",
  pending: false,
  error: null,
  hydrate: (status) =>
    set({
      status,
      pending: false,
      error: null,
    }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setPending: (pending) => set({ pending }),
  setError: (error) => set({ error }),
  markAuthenticated: () =>
    set({
      status: "authenticated",
      pending: false,
      error: null,
      password: "",
    }),
  markUnauthenticated: () =>
    set({
      status: "unauthenticated",
      pending: false,
      error: null,
      password: "",
    }),
  resetForm: () =>
    set({
      username: "",
      password: "",
      pending: false,
      error: null,
    }),
}));
