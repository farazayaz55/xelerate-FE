import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  PreCanned: {
    group: { name: "All assets", id: "" },
    solution: "",
    aggregation: "mean",
    start: null,
    end: null,
    filter: "",
    played: false,
    cache: {},
  },
  HorizontalBar: {
    group: { name: "All assets", id: "" },
    solution: "",
    datapoint: "",
    aggregation: "mean",
    start: null,
    end: null,
    filter: "",
    played: false,
    cache: {},
  },
  Box: {
    group: { name: "All assets", id: "" },
    solution: "",
    datapoint: "",
    start: null,
    end: null,
    filter: "",
    played: false,
    cache: {},
  },
};

export const GroupAnalyticsSlice = createSlice({
  name: "AssetView",
  initialState,
  reducers: {
    setPreCanned: (state, action) => {
      state.PreCanned = { ...state.PreCanned, ...action.payload };
      return state;
    },
    setHorizontalBar: (state, action) => {
      state.HorizontalBar = { ...state.HorizontalBar, ...action.payload };
      return state;
    },
    setBox: (state, action) => {
      state.Box = { ...state.Box, ...action.payload };
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setPreCanned,
  setHorizontalBar,
  setBox,
} = GroupAnalyticsSlice.actions;

export default GroupAnalyticsSlice.reducer;
