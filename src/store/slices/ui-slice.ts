import { createSlice } from "@reduxjs/toolkit";

export type UiState = { maskBalances: boolean };
export const initialUiState: UiState = { maskBalances: true };

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    toggleBalanceMask(state) {
      state.maskBalances = !state.maskBalances;
    },
  },
});

export const { toggleBalanceMask } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
