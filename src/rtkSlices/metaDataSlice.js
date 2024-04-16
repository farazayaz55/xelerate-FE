import { createSlice, current } from "@reduxjs/toolkit";
const camelCase = require("camelcase");
import Keys from "Keys";

const initialState = {
  services: [],
  userInfo: {},
  userCreds: {},
  selectedGroup: null,
  skip: true,
  loader: true,
  groupPermissions: {},
  settings: false,
  multiAssetSensors:[],
  multiAssetActuators:[],
  branding: {
    primary: null,
    secondary: null,
    logo: null,
    userFlag: null,
    applied: false,
    id: null,
    brandingBlockList: [],
    pinnedSolutions: [],
  },
};

var pinnedSolutions;

function addCustomFont(font) {
  var customFont = new FontFace("customfont", "url('" + font + "')");
  customFont.load().then(function () {
    document.fonts.add(customFont);
    document.getElementsByTagName("body")[0].style.fontFamily = "customfont";
  });
}

function sortArray(data, template) {
  let arr = JSON.parse(JSON.stringify(data));
  arr.forEach((tab) => {
    let foundIndex = template.findIndex((t) => t == tab.name);
    if (foundIndex != -1) {
      tab.position = parseInt(foundIndex);
    }
  });
  arr.sort(function (a, b) {
    return a["position"] - b["position"];
  });
  return arr;
}

export const metaDataSlice = createSlice({
  name: "metaData",
  initialState,
  reducers: {
    setRole: (state, action) => {
      let metaData = {};
      var services = JSON.parse(JSON.stringify(action.payload?.services));
      pinnedSolutions.forEach((pinned) => {
        if (services.find((s) => s.serviceId == pinned.solution)) {
          services.find((s) => s.serviceId == pinned.solution).pinned =
            pinned.pin;
        }
      });
      let groupPermissions = {};
      let defaultApps = [{ name: "Solutions" }, { name: "Support" }];
      if (Keys.deviceCatalogue == "true")
        defaultApps.push({ name: "Device Catalogue" });
      let apps = [...defaultApps, ...action.payload?.modules];
      apps = sortArray(apps, [
        "Solutions",
        "ROI Calculator",
        "Analytics",
        "Device Catalogue",
        "Simulation",
        "Solution Management",
        "Settings",
        "Administration",
        "Alarms Management",
        "Support",
      ]);
      let arr = [];
      let appPaths = [];
      action.payload?.modules.forEach((elm) => {
        sortArray(elm.tabs, [
          "User Management",
          "Role Management",
          "Device Management",
          "Group Management",
        ]).forEach((tab) => {
          // if (!(elm.name == "Administration" && tab.permission != "ALL"))
          appPaths.push({
            path: camelCase(tab.name).replace(" ", ""),
            name: tab.name,
            layout: `/${camelCase(elm.name).replace(" ", "")}/`,
            permission: tab.permission,
          });
        });
      });
      let idMap = {};
      console.log({services})
      services.forEach((elm) => {
        // console.log({elm})
        groupPermissions[elm.serviceId] = elm.tabs.find(
          (tab) => tab.name == "Group Management"
        )
          ? elm.tabs.find((tab) => tab.name == "Group Management").permission
          : "DISABLE";
        if (elm.details) {
          let newTabs = sortArray(
            elm.tabs.filter((t) => t.name != "Group Management"),
            [
              "Digital Twin",
              "Video Analytics",
              "Monitoring",
              "Analytics",
              "Tracking",
              "Controlling",
              "Configuration",
              "Rule Management",
              "Alarms",
              "Events",
              "History",
            ]
          );
          let service = elm.details;
          idMap[service.name] = service._id;
          let assets = service.configuredAssets.length ? service.configuredAssets.map((asset) => {
            return {
              id: asset._id, 
              name: asset.name,
              image: asset.logoPath
            }
          }) : [{
            name: service.configuredAsset.name,
            image: service.configuredAsset.logoPath,
          }];
          let tabs = {};
          let tags = [];
          let defaultLocation = elm.details.defaultLocation;
          let widgetDatapoints = elm.details.widgetDatapoints;
          let trend = elm.details.trend;
          if (elm.details?.tags) tags = elm.details.tags.map((tag) => tag._id);
          let meta = [];
          let metaTags = [];
          if (elm.details?.metaTags) {
            meta = elm.details.metaTags.map((tag) => tag._id);
            metaTags = elm.details?.metaTags;
          }

          if (typeof service?.metaData === "string")
            tabs = JSON.parse(service?.metaData)?.tabs;
          else tabs = service?.metaData?.tabs;
          arr.push({
            name: service.name,
            id: service._id,
            description: service.description,
            sensors: service.configuredSensors.filter((e) => e.config != true),
            actuators: service.configuredActuators.filter(
              (e) => e.config != true
            ),
            configSensors: service.configuredSensors.filter(
              (e) => e.config == true
            ),
            configActuators: service.configuredActuators.filter(
              (e) => e.config == true
            ),
            dataPointThresholds: service?.dataPointThresholds
              ? service.dataPointThresholds
              : [],
            featureTabs: tabs,
            esbMetaData: service.esbAssetMapping,
            path: service._id,
            solutionLayout: service?.layout
              ? service?.layout
              : {
                  map: {
                    default: "Map",
                    mapModes: ["street", "light", "heat", "satellite"],
                    columns: ["deviceInfo", "datapoints", "metaTags"],
                  },
                },
            layout: "/solutions/",
            tabs: newTabs,
            group: elm.group,
            meta,
            cost: service.cost,
            unit: service.unit,
            target: service.target,
            metaTags,
            tags: tags,
            widgetDatapoints,
            trend,
            defaultLocation,
            assets: assets,
            image: elm.details.logoPath,
            profile: elm.details.profile,
            assetMapping: service.assetMapping,
            parentChildEnabled: service.parentChildEnabled
          });
          if (elm.pinned) {
            arr[arr.length - 1].pinned = elm.pinned;
          }
        }
      });
      metaData.apps = apps;
      metaData.idMap = idMap;
      metaData.servicesNew = services
        .filter((e) => e?.details)
        .map((e) => e?.details);
      metaData.services = arr;
      metaData.appPaths = appPaths;
      metaData.groupPermissions = groupPermissions;
      state = { ...state, ...metaData };
      return state;
    },
    setBranding: (state, action) => {
      let primaryColor = action.payload?.branding
        ? action.payload.branding.primaryColor
        : Keys?.primary
        ? Keys.primary
        : "#3399ff";
      let secondaryColor = action.payload?.branding
        ? action.payload.branding.secondaryColor
        : Keys?.secondary
        ? Keys.secondary
        : "#607d8b";
      let logo = action.payload?.branding
        ? action.payload.branding.logoPath
        : Keys?.logo
        ? Keys.logo
        : null;
      let userFlag = action.payload?.userFlag;
      let brandingBlockList = action.payload?.brandingBlockList;
      let fonts;
      fonts = action.payload?.branding ? action.payload.branding.font : null;
      pinnedSolutions = action.payload?.pinnedSolutions
        ? action.payload?.pinnedSolutions
        : [];

      if (fonts) {
        if (!fonts.uploaded) {
          document.getElementsByTagName("body")[0].style.fontFamily =
            fonts.font;
        } else addCustomFont(fonts.font);
      } else if (Keys?.font) {
        if (Keys.uploaded != "true") {
          document.getElementsByTagName("body")[0].style.fontFamily = Keys.font;
        } else addCustomFont(Keys.font);
      } else {
        document.getElementsByTagName("body")[0].style.fontFamily = "Open Sans";
      }

      let res = {
        ...state,
        branding: {
          ...state.branding,
          id: action.payload?.branding ? action.payload?.branding._id : null,
          applied: action.payload?.branding ? true : false,
          primaryColor,
          secondaryColor,
          logo,
          fonts,
          pinnedSolutions,
        },
      };
      if (userFlag || userFlag == false) res.branding.userFlag = userFlag;
      if (brandingBlockList) res.branding.brandingBlockList = brandingBlockList;
      return res;
    },

    setBrandingBlockList: (state, action) => {
      state.branding.brandingBlockList = action.payload;
      return state;
    },

    setSelectedGroup: (state, action) => {
      state = { ...state, selectedGroup: action.payload };
      return state;
    },
    setUser: (state, action) => {
      state = { ...state, userInfo: action.payload };
      return state;
    },
    setUserCreds: (state, action) => {
      state = { ...state, userCreds: action.payload };
      return state;
    },
    setSettings: (state, action) => {
      state = { ...state, settings: action.payload ? true : false };
      return state;
    },
    setSkip: (state, action) => {
      state = { ...state, skip: action.payload };
      return state;
    },
    setServices: (state, action) => {
      state = { ...state, services: action.payload };
      return state;
    },
    setLoader: (state, action) => {
      state = { ...state, loader: action.payload };
      return state;
    },
    setMultiAssetSensors: (state, action) => {
      state = { ...state, multiAssetSensors: action.payload };
      return state;
    },
    resetMetaData: (state) => {
      state = initialState;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setRole,
  setBranding,
  setSelectedGroup,
  setUser,
  setServices,
  setSkip,
  setLoader,
  resetMetaData,
  setSettings,
  setBrandingBlockList,
  setUserCreds,
  setMultiAssetSensors
} = metaDataSlice.actions;

export default metaDataSlice.reducer;
