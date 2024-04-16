import { createSlice } from "@reduxjs/toolkit";

export const ruleManagement = createSlice({
  name: "ruleManagement",
  initialState: {
    selected: null,
  },
  reducers: {
    setSelected: (state, action) => {
      state = { ...statea, selected: action.payload };
      return state;
    },
  },
});

export const { next } = ruleManagement.actions;

export default ruleManagement.reducer;
