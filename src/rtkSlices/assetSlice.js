import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  device: null,
  geofence: [],
  videoAnalyticsDate: null,
  videoAnalyticsSearchText: null,

};

export const AssetSlice = createSlice({
  name: "Asset",
  initialState,
  reducers: {
    setDevice: (state, action) => {
      state.device = { ...state.device, ...action.payload };
      return state;
    },

    setGeofence: (state, action) => {
      state.geofence = action.payload;
      return state;
    },

    setGeofence: (state, action) => {
      state.geofence = action.payload;
      return state;
    },

    setVideoAnalyticsDate: (state, action) => {
      state.videoAnalyticsDate = action.payload;
      return state;
    },

    setVideoAnalyticsSearchText: (state, action) => {
      state.videoAnalyticsSearchText = action.payload;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDevice, setGeofence, setVideoAnalyticsDate, setVideoAnalyticsSearchText } = AssetSlice.actions;

export default AssetSlice.reducer;
