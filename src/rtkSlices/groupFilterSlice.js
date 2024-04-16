import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalTree: {
    "1": {
      name: "Loading...",
      id: "1",
      childGroups: {},
    },
  },
  first: true,
  noOfDevices: "",
  refresh:true,
  selected: "All Assets",
  expanded: ["0:All assets"],
  view: "1",
  alarms: [],
  connection: "",
  measurement: "",
  metaTags: "",
  group: { name: "All assets", id: "" },
  percist: {
    alarms: [],
    connection: "",
    metaTags: {
      key: "",
      value: "",
    },
    measurement: {
      parameter: "",
      operation: "",
      value: "",
    },
  },
  searchString: "",
  selectedNode: null,
  selectedNodeChain: ["0:All assets"],
  rightPaneOpen: false,
  matchedNodes:[]
};

export const groupFilterSlice = createSlice({
  name: "groupFilter",
  initialState,
  reducers: {
    setGroupFilter: (state, action) => {
      state = { ...state, ...action.payload };
      return state;
    },
    resetGroupFilter: (state) => {
      state = initialState;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setGroupFilter, resetGroupFilter } = groupFilterSlice.actions;

export default groupFilterSlice.reducer;
