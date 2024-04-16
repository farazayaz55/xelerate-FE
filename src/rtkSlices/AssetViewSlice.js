import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mapPage: 1,
  listPage: 1,
  view: "Map",
  liveArr: [],
};

export const AssetViewSlice = createSlice({
  name: "AssetView",
  initialState,
  reducers: {
    setMapPage: (state, action) => {
      state.mapPage = action.payload;
      return state;
    },
    setListPage: (state, action) => {
      state.listPage = action.payload;
      return state;
    },
    setView: (state, action) => {
      state.view = action.payload;
      return state;
    },
    setLiveArr: (state, action) => {
      state.liveArr = action.payload;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setMapPage,
  setListPage,
  setView,
  setLiveArr,
} = AssetViewSlice.actions;

export default AssetViewSlice.reducer;
