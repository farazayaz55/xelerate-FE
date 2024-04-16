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
  devicesCount: {},
  totalDevices: "",
  connectedDevices: "",
  search: "",
  searching: false,
  searchFields: [],
  selected: "All Assets",
  expanded: ["0:All assets"],
  expandedTreeView: ["0:All assets"],
  view: "1",
  open: false,
  alarms: [],
  assetTypes: null,
  sensors:null,
  connection: "",
  measurement: "",
  metaTags: "",
  group: { name: "All assets", id: "" },
  percist: {
    alarms: [],
    assetTypes: null,
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
  matchedNodes: [],
};

export const filterDeviceSlice = createSlice({
  name: "filterDevice",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state = { ...state, ...action.payload };
      return state;
    },
    resetFilter: (state, service) => {
      let { search, searchFields, searching } = state;
      if(service && service.payload && service.payload.group && service.payload.group.id){
        console.log('hereee')
        state = { 
          ...initialState, 
          group: service.payload.group, 
          expanded: [`${service.payload.group.id}:${service.payload.group.name}`], 
          selected: service.payload.group.name, 
          search, 
          searchFields, searching,
          noOfDevices: service?.payload?.filtersValue?.noOfDevices, 
          devicesCount: service?.payload?.filtersValue?.devicesCount,
          totalDevices: service?.payload?.filtersValue?.noOfDevices
        };
      }
      else{
        console.log({service})
        console.log({state})
        state = { 
          ...initialState, 
          search, 
          searchFields, 
          searching,
          noOfDevices: service?.payload?.filtersValue?.noOfDevices, 
          devicesCount:  service?.payload?.filtersValue?.devicesCount,
          totalDevices: service?.payload?.filtersValue?.noOfDevices
        };
      }
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFilter, resetFilter } = filterDeviceSlice.actions;

export default filterDeviceSlice.reducer;
