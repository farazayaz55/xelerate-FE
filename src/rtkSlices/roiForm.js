import { createSlice } from "@reduxjs/toolkit";

export const roiFormSlice = createSlice({
  name: "roiForm",
  initialState: {},
  reducers: {
    setRoiForm: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setRoiForm } = roiFormSlice.actions;

export default roiFormSlice.reducer;
