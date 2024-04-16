import { createSlice } from "@reduxjs/toolkit";

export const roiWizard = createSlice({
  name: "roiWizard",
  initialState: 0,
  reducers: {
    next: (state) => {
      return (state += 1);
    },
    back: (state) => {
      return (state -= 1);
    },
    reset: (state) => {
      return (state = 0);
    },
  },
});

export const { next, back, reset } = roiWizard.actions;

export default roiWizard.reducer;
