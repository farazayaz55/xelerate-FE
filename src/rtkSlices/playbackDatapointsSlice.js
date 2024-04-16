import { createSlice } from "@reduxjs/toolkit";


export const playbackDatapointSlice = createSlice({
  name: "playbackDatapoints",
  initialState: {},
  reducers: {
    setPlaybackDatapoints: (state, action) => {
      return action.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPlaybackDatapoints } = playbackDatapointSlice.actions;

export default playbackDatapointSlice.reducer;
