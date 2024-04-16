import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: 0,
  devices: 0,
  serviceId: "",
  name: "",
  description: "",
  vanish: false,
  devPrompt: false,
  duration: null,
  dataPointThresholds: [],
  cover: null,
  layout: null,
  widgetDatapoints: {},
  svg: null,
  tags: [],
  trend: { defaultDatapoint: "", defaultAggregation: "" },
  meta: [],
  asset: [],
  actuator: [],
  monitoring: [],
  datapoints: [],
  assetMapping: [],
  configuredSensors: [],
  configuredActuators: [],
  defaultLocation: {},
  mapMarkerUrl: { value: "", selected: false },
  digitalMarketUrl: { value: "", selected: false },
  configuredAssets:[],
  metaData: {
    location: false,
    maintenance: false,
    videoAnalytics: false,
    digitalTwin: false,
  },
  parentChildEnabled: false,
  persist: {
    tags: [],
    meta: [],
    dataPointThresholds: {
      customColors: [
        { label: "Color 1", value: "#ff1001", min: "0", max: "33" },
        { label: "Color 2", value: "#febe00", min: "34", max: "66" },
        {
          label: "Color 3",
          value: "#03bd00",
          min: "67",
          max: "100",
        },
      ],
      colors: [
        { label: "Color 1", value: "#ff1001" },
        { label: "Color 2", value: "#febe00" },
        {
          label: "Color 3",
          value: "#03bd00",
        },
      ],
      min: 0,
      max: 100,
      reverse: false,
      customRange: false,
    },
  },
  map: {
    default: "Map",
    mapModes: ["street", "light", "heat", "satellite"],
    mapDefault: "street",
    markerDefault: "Connectivity",
    columns: ["deviceInfo", "datapoints", "metaTags"],
    identifier: "default",
  },
};

export const serviceCreatorSlice = createSlice({
  name: "serviceCreator",
  initialState,
  reducers: {
    setService: (state, action) => {
      state = { ...state, ...action.payload };
      return state;
    },

    resetService: (state) => {
      state = initialState;
      return state;
    },

    resetColor: (state) => {
      state = {
        ...state,
        persist: {
          ...state.persist,
          dataPointThresholds: initialState.persist.dataPointThresholds,
        },
      };
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setService,
  resetService,
  resetColor,
} = serviceCreatorSlice.actions;

export default serviceCreatorSlice.reducer;
