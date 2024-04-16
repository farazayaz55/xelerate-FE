//----------------CORE-----------------//
import React, { useEffect, useState } from "react";
import { Route, Switch, Redirect, BrowserRouter } from "react-router-dom";
import Test from "components/test";
import { useDispatch } from "react-redux";
import {
  setRole,
  setBranding,
  setUser,
  setLoader,
  setSettings,
} from "rtkSlices/metaDataSlice";
import { useGetSpecificRoleQuery } from "services/roles";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { SnackbarProvider } from "notistack";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { createTheme, ThemeProvider } from "@mui/material/styles";
//-------------EXTERNAL COMPONENTS--------//
import PrivateRoute from "routes/PrivateRoute";
import PublicRoute from "routes/PublicRoute";
import Error from "routes/Error";
import Analytics from "layouts/analytics";
import Admin from "layouts/admin";
import Login from "components/Auth";
// import SuperAdmin from "layouts/superAdmin";
import ROI from "layouts/roi";
import Manager from "layouts/services";
import Settings from "layouts/Settings.js";
import ServiceCreator from "layouts/solutionCreator";
import Migration from "layouts/solutionEnablement";
// import Simulation from "layouts/simulation";
import Support from "layouts/support";
import AlarmsDashboard from "layouts/alarmsDashboard";
import { useGetBrandingQuery } from "services/branding";
import MyCustomChildren from "components/SnackBar";
import { useGetUsersQuery } from "services/user";
import CookieCheck from "components/Cookie Check";
import Keys from "Keys";
import "./style.css";

const enObj = {
  serviceName: "Smart Hajj Management",
  pilgrim: "Pilgrim",
  police: "Police",
  medical: "Medical",
  assistance: "Assistance",
  hamlaSupervisor: "Hamla Supervisor",
  criticalAlarms: "Critical",
  majorAlarms: "Major",
  minorAlarms: "Minor",
  warningAlarms: "Warning",
  gender: "Gender",
  age: "Age",
  nationality: "Nationality",
  filters: "Filters",
  listView: "List",
  mapView: "Map",
  heatMapView: "Heat Map",
  search: "Search",
  Monitoring: "Monitoring",
  Alarms: "Alarms",
  Events: "Events",
  disconnected: "Disconnected",
  noAlarms: "No Alarms Found",
  events: "Events",
  noEvents: "No Events found",
  Dashboard: "Dashboard",
  "Alerts Handling": "Alerts Handling",
  logout: "Logout",
  filterss: "Filter(s)",
  connected: "Connected",
  status: "Status",
  group: "Group",
  measurement: "Measurement",
  sensorData: "Sensor Data",
  operator: "Operator",
  value: "Value",
  equal: "Equal",
  greater: "Greater",
  greaterEqual: "Greater & Equal",
  less: "Less",
  lessEqual: "Less & Equal",
  reset: "Reset",
  apply: "Apply",
  activityMonitor: "Activity Monitor",
  messageText: "Message will be sent to ",
  devices: "devices",
  messaging: "Messaging",
  globalGreeting: "Global Greeting",
  eidDay: "Eid Day",
  hajjSeason: "Hajj Season",
  message: "Message",
  cancel: "Cancel",
  submit: "Submit",
  messaging: "Messaging",
  name: "Name",
  updated: "Updated",
  deviceInfo: "Device Information",
  asset: "Asset",
  id: "ID",
  hamla: "Hamla",
  number: "Mobile",
  heartRate: "Heart Rate",
  oxygen: "Oxygen",
  bloodPressure: "Blood Pressure",
  battery: "Battery",
  charging: "Charging",
  wearingStatus: "Wearing Status",
  speed: "Speed",
  "Taken off": "Taken off",
  Wearing: "Wearing",
  realtime: "Realtime",
};

const arObj = {
  serviceName: "منصة نُسك",
  pilgrim: "الحجاج​",
  police: "رجال الأمن​",
  medical: "الممارسين الصحيين​",
  assistance: "المساعدين الميدانيين​",
  hamlaSupervisor: "مشرفين الحملات​",
  criticalAlarms: "الإنذارات الحرجة",
  majorAlarms: "الإنذارات الرئيسية",
  minorAlarms: "إنذارات طفيفة",
  warningAlarms: "إنذارات التحذير",
  gender: "الجنس",
  age: "العمر",
  nationality: "الجنسية",
  filters: "عوامل التصفية",
  listView: "عرض القائمة",
  mapView: "عرض الخريطة",
  heatMapView: "عرض الخريطة الحرارية",
  search: "البحث",
  Monitoring: "مراقبة",
  Alarms: "البلاغات​",
  Events: "الأحداث",
  disconnected: "غير متصل",
  noAlarms: "لا يوجد بلاغات",
  events: "الأحداث",
  noEvents: "لا توجد أحداث",
  Dashboard: "شاشة",
  "Alerts Handling": "إدارة البلاغات",
  logout: "تسجيل الخروج",
  filterss: "عوامل التصفية​",
  connected: "متصل",
  status: "الحالة",
  group: "نوع الدور​",
  measurement: "القراءات​",
  sensorData: "بيانات الاستشعار",
  operator: "المشغل",
  value: "القيمة",
  equal: "متساوي",
  greater: "أكبر",
  greaterEqual: "أكبر من و يساوي",
  less: "أقل",
  lessEqual: "أقل من و يساوي",
  reset: "إعادة تعيين",
  apply: "تطبيق",
  activityMonitor: "مراقبة النشاط",
  messageText: "سيتم إرسال الرسالة إلى",
  devices: "أجهزة",
  messaging: "إرسال رسالة عامة​",
  globalGreeting: "رسالة ترحيبية",
  eidDay: "رسالة معايدة",
  hajjSeason: "رسالة عامة للحج",
  message: "رسالة",
  cancel: "إلغاء",
  submit: "إرسال",
  messaging: "مراسلة",
  name: "الإسم",
  updated: "آخر تحديث",
  deviceInfo: "معلومات الجهاز",
  asset: "الجهاز",
  id: "الهوية الشخصية",
  hamla: "الحملة",
  number: "رقم الجوال​",
  heartRate: "معدل نبضات القلب",
  oxygen: "مستوى الأكسجين",
  bloodPressure: "ضغط الدم",
  battery: "مستوى البطارية",
  charging: "الشحن",
  wearingStatus: "حالة الارتداء",
  speed: "السرعة",
  "Taken off": "غير مرتداة",
  Wearing: "مرتداة حاليًا",
  realtime: "في الوقت الحالى",
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enObj },
    ar: { translation: arObj },
  },
  lng: window.localStorage.getItem("Language")
    ? window.localStorage.getItem("Language")
    : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

function App() {
  const metaDataValue = useSelector((state) => state.metaData);
  const [roleState, setRoleState] = React.useState(true);
  const [brandingState, setBrandingState] = React.useState(true);
  const dispatch = useDispatch();

  function getToken() {
    return window.localStorage.getItem("token") || false;
  }

  const brandingRes = useGetBrandingQuery(
    { user: "true", id: "" },
    {
      skip: metaDataValue.skip && !getToken(),
    }
  );

  const userRes = useGetUsersQuery(
    {
      token: window.localStorage.getItem("token"),
      parameters: `?id=${window.localStorage.getItem("user")}`,
    },
    {
      skip: brandingState || !getToken(),
    }
  );
  const roleRes = useGetSpecificRoleQuery(userRes.data?.payload.Users ? userRes.data?.payload.Users[0].role : userRes.data?.payload[0]?.role, {
    skip: roleState || !getToken(),
  });

  useEffect(()=> {
    let url = window.location.href
    console.log("INITIALIZED WEB APPP")
    console.log({url})
    if(url.includes("rensair")){
      let link = document.querySelector("link[rel='icon']")
      if(!link) {
        link = document.createElement("link")
        link.rel= 'icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href="https://xelerate-video.s3.eu-central-1.amazonaws.com/favicon-rensair.ico"
    }
  }, [])

  useEffect(() => {
    if (userRes.isSuccess && !userRes.isFetching) {
      console.log({userRes})
      // When user updates himself than the api returns the user in Users else it comes in the payload
      let user = userRes.data.payload.Users ? userRes.data.payload.Users[0] : userRes.data.payload[0];
      
      window.localStorage.setItem("role", user?.role);
      setRoleState(false);
      dispatch(
        setUser({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          phone: user.phone,
          email: user.email,
          userId: user._id,
          pinnedSolutions: brandingRes.data.payload?.pinnedSolutions || [],
        })
      );
    }
  }, [userRes.isFetching]);

  useEffect(() => {
    if (roleRes.isSuccess && !roleRes.isFetching) {
      window.localStorage.setItem("Language", "en");
      dispatch(setRole(roleRes.data.payload));
      dispatch(setLoader(false));
    }
  }, [roleRes.isFetching]);

  useEffect(() => {
    if (brandingRes.isSuccess && !brandingRes.isFetching) {
      dispatch(setSettings(brandingRes.data.payload));
      dispatch(setBranding(brandingRes.data.payload));
      setBrandingState(false);
    }
  }, [brandingRes.isFetching]);

  const Theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 1400,
        lg: 1200,
        xl: 1536,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: "13px",
            borderRadius: "200px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            // paddingTop: "0px",
            // paddingBottom: "0px",
          },
        },
      },
    },
    palette: {
      primary: {
        main: metaDataValue?.branding?.primaryColor
          ? metaDataValue?.branding?.primaryColor
          : Keys?.primary
            ? Keys.primary
            : "#3399ff",
      },
      secondary: {
        main: metaDataValue?.branding?.secondaryColor
          ? metaDataValue?.branding?.secondaryColor
          : Keys?.secondary
            ? Keys.secondary
            : "#607d8b",
      },
      error: {
        main: "#bf3535",
        light: "#844204",
      },
      major: {
        main: "#844204",
        contrastText: "#fff",
      },
      warning: { main: "#fe9f1b" },
      info: { main: "#3399ff" },
    },
    typography: {
      fontFamily: metaDataValue.branding.fonts
        ? metaDataValue.branding.fonts.uploaded == false
          ? metaDataValue.branding.fonts
          : "customfont"
        : Keys?.font
          ? Keys?.uploaded == "false"
            ? Keys?.fonts
            : "customfont"
          : "Open Sans",
    },
  });

  return (
    <ThemeProvider theme={Theme}>
      <BrowserRouter>
        {getToken() ? (
          metaDataValue.loader ? null : (
            <CookieCheck />
          )
        ) : (
          <CookieCheck />
        )}
        <Switch>
          <PublicRoute path="/auth/login" component={Login} />
          <PublicRoute path="/auth/validate" component={Login} />
          <PrivateRoute
            path="/analytics"
            component={Analytics}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PublicRoute
            path="/auth/forgotPassword"
            component={Login}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <Route path="/auth/resetPassword/:token" component={Login} />
          <PrivateRoute
            path="/roiCalculator"
            component={ROI}
            loader={getToken() ? metaDataValue.loader : false}
          />
          {/* <PrivateRoute path="/superAdmin" component={SuperAdmin} /> */}
          <PrivateRoute
            path="/administration"
            component={Admin}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/solutions"
            component={Manager}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/test"
            component={Test}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/support"
            component={Support}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/alarms-dashboard"
            component={AlarmsDashboard}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/settings"
            component={Settings}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <PrivateRoute
            path="/solutionEnablement"
            component={Migration}
            loader={getToken() ? metaDataValue.loader : false}
          />
          {/* <PrivateRoute
            path="/simulation"
            component={Simulation}
            loader={  getToken() ? metaDataValue.loader : false}
          /> */}
          <PrivateRoute
            path="/solutionManagement"
            component={ServiceCreator}
            loader={getToken() ? metaDataValue.loader : false}
          />
          <Redirect from="/" to="auth/login" exact />
          <Route component={Error}></Route>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      content={(key, message) => (
        <MyCustomChildren id={key} message={message} />
      )}
    >
      <App />
    </SnackbarProvider>
  );
}
