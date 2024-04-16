import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
//----------------SLICES------------------//
import metaDataReducer from "rtkSlices/metaDataSlice";
import predictivePropsReducer from "rtkSlices/predictivePropsSlice";
import filteredServicesReducer from "rtkSlices/filteredServicesSlice";
import freeformChartReducer from "rtkSlices/freeformChartSlice";
import playbackDatapointsReducer from "rtkSlices/playbackDatapointsSlice";
import selectedTagsReducer from "rtkSlices/selectedTagsSlice";
import roiWizardReducer from "rtkSlices/roiWizard";
import ruleManagementReducer from "rtkSlices/ruleManagementSlice";
import roiFormReducer from "rtkSlices/roiForm";
import filterDeviceSliceReducer from "rtkSlices/filterDevicesSlice";
import alarmsFilterSliceReducer from "rtkSlices/AlarmsFilterSlice";
import assetViewReducer from "rtkSlices/AssetViewSlice";
import assetReducer from "rtkSlices/assetSlice";
import serviceCreatorReducer from "rtkSlices/ServiceCreatorSlice";
import groupAnalyticsReducer from "rtkSlices/GroupAnalyticsSlice";
import profilesReducer from "rtkSlices/profilesSlice";
//--------------SERVICES------------------//
import { signinApi } from "services/auth";
import { servicesApi } from "services/services";
import { brandingApi } from "services/branding";
import { rolesApi } from "services/roles";
import { devicesApi } from "services/devices";
import { rulesApi } from "services/rules";
import { globalRulesApi } from "services/rulesGlobal";
import { alarmsApi } from "services/alarms";
import { analyticsApi } from "services/analytics";
import { digitalTwinApi } from "services/digitalTwin";
import { controllingApi } from "services/controlling";
import { emailApi } from "services/email";
import { tagsApi } from "services/tags";
import { globalLocationsApi } from "services/globalLocations";
import { globalControllingApi } from "services/controllingGlobal";
import { locationsApi } from "services/locations";
import { eventsApi } from "services/events";
import { monitoringApi } from "services/monitoring";
import { supportApi } from "services/support";
import { simulatorApi } from "services/simulator";
import { simulationApi } from "services/simulation";
import { userApi } from "services/user";
import { groupsApi } from "services/groups";

export const store = configureStore({
  reducer: {
    metaData: metaDataReducer,
    predictiveProps: predictivePropsReducer,
    filteredServices: filteredServicesReducer,
    freeformChart: freeformChartReducer,
    playbackDatapoints: playbackDatapointsReducer,
    filterDevice: filterDeviceSliceReducer,
    alarmsFilter: alarmsFilterSliceReducer,
    selectedTags: selectedTagsReducer,
    roiWizard: roiWizardReducer,
    ruleManagement: ruleManagementReducer,
    roiForm: roiFormReducer,
    assetView: assetViewReducer,
    asset: assetReducer,
    serviceCreator: serviceCreatorReducer,
    groupAnalytics: groupAnalyticsReducer,
    profiles: profilesReducer,
    [globalControllingApi.reducerPath]: globalControllingApi.reducer,
    [signinApi.reducerPath]: signinApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [brandingApi.reducerPath]: brandingApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [devicesApi.reducerPath]: devicesApi.reducer,
    [tagsApi.reducerPath]: tagsApi.reducer,
    [rulesApi.reducerPath]: rulesApi.reducer,
    [globalRulesApi.reducerPath]: globalRulesApi.reducer,
    [alarmsApi.reducerPath]: alarmsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [digitalTwinApi.reducerPath]: digitalTwinApi.reducer,
    [controllingApi.reducerPath]: controllingApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [globalLocationsApi.reducerPath]: globalLocationsApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    [monitoringApi.reducerPath]: monitoringApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [simulationApi.reducerPath]: simulationApi.reducer,
    [simulatorApi.reducerPath]: simulatorApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [groupsApi.reducerPath]: groupsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(globalControllingApi.middleware)
      .concat(globalRulesApi.middleware)
      .concat(signinApi.middleware)
      .concat(brandingApi.middleware)
      .concat(rolesApi.middleware)
      .concat(servicesApi.middleware)
      .concat(devicesApi.middleware)
      .concat(tagsApi.middleware)
      .concat(rulesApi.middleware)
      .concat(alarmsApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(controllingApi.middleware)
      .concat(digitalTwinApi.middleware)
      .concat(emailApi.middleware)
      .concat(globalLocationsApi.middleware)
      .concat(eventsApi.middleware)
      .concat(locationsApi.middleware)
      .concat(monitoringApi.middleware)
      .concat(supportApi.middleware)
      .concat(simulatorApi.middleware)
      .concat(simulationApi.middleware)
      .concat(userApi.middleware)
      .concat(groupsApi.middleware),
});

setupListeners(store.dispatch);
