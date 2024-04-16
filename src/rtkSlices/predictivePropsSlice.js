import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const predictivePropsSlice = createSlice({
  name: "predictiveProps",
  initialState,
  reducers: {
    setPredictiveProps: (state, action) => {
      state = { ...state, ...action.payload };
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPredictiveProps } = predictivePropsSlice.actions;

export default predictivePropsSlice.reducer;
