//----------------CORE-----------------//
import React from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
const camelcase = require("camelcase");
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Avatar from "@mui/material/Avatar";
//----------------MUI ICONS-----------------//
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import Person from "@mui/icons-material/Person";
import AppsIcon from "@mui/icons-material/Apps";
import SettingsIcon from "@mui/icons-material/Settings";
import RouterIcon from "@mui/icons-material/Router";
import CalculateIcon from "@mui/icons-material/Calculate";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CodeIcon from "@mui/icons-material/Code";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import WebIcon from "@mui/icons-material/Web";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
//----------------EXTERNAL COMPONENTS-----------------//
import { resetMetaData } from "rtkSlices/metaDataSlice";
import { useLazyLogoutQuery } from "services/auth";
import Popover from "components/Popover";
import Search from "./Search";

export default function AdminNavbarLinks(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const useStyles = makeStyles({
    gridElm: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100px",
      margin: "5px",
      transition: "0.3s",
      borderRadius: "10px",
      "&:hover": {
        transform: "translate(0, -3px)",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      },
    },
    gridItem: {
      textAlign: "center",
      width: "110px",
      height: "70px",
      padding: "10px",
      borderRadius: "10px",
      "&:hover": {
        color: metaDataValue.branding?.primaryColor,
      },
    },
    gridRoot: {
      display: "flex",
      padding: "8px 10px 0px 10px",
    },
    title: {
      fontSize: "10px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  });
  const classes = useStyles(props);
  const dispatch = useDispatch();

  const [openNotification, setOpenNotification] = React.useState(null);
  const [openProfile, setOpenProfile] = React.useState(null);
  const [openLanguage, setOpenLanguage] = React.useState(null);

  const [logout] = useLazyLogoutQuery();

  function popperLanguage() {
    return (
      <MenuList role="menu">
        <MenuItem
          id="en"
          onClick={() => {
            changeLanguage("en");
          }}
          // className={classes.dropdownItem}
          style={{
            backgroundColor:
              window.localStorage.getItem("Language") == "en"
                ? metaDataValue.branding?.primaryColor
                : "",
            color:
              window.localStorage.getItem("Language") == "en" ? "white" : "",
          }}
        >
          English
        </MenuItem>
        {/* <Divider light /> */}
        {/* <MenuItem
          onClick={() => {
            changeLanguage("ar");
          }}
          // className={classes.dropdownItem}
          style={{
            backgroundColor:
              window.localStorage.getItem("Language") == "ar" ? "#3399ff" : "",
            color:
              window.localStorage.getItem("Language") == "ar" ? "white" : "",
          }}
        >
          <p style={{ textAlign: "right" }}>عربى</p>
        </MenuItem> */}
      </MenuList>
    );
  }

  function popperGrid() {
    return (
      <MenuList role="menu">
        {chunk(metaDataValue.apps, 3).map((chunk) => (
          <div className={classes.gridRoot}>
            {chunk.map((elm) => {
              return (
                <span className={classes.gridElm}>
                  {elm.name == "Device Catalogue" ? (
                    <a
                      id="device-catalogue"
                      className={classes.gridItem}
                      style={{
                        color: window.location.pathname.includes(
                          camelcase(elm.name)
                        )
                          ? metaDataValue.branding?.primaryColor
                          : "#757575",
                      }}
                      href="https://devicepartnerportal.softwareag.com/devices"
                      target="_blank"
                    >
                      {generateIcon(paths[elm.name]?.icon, elm.name)}
                    </a>
                  ) : (
                    <Link
                      id={`module-${elm.name}`}
                      to={paths[elm.name]?.path}
                      className={classes.gridItem}
                      style={{
                        color: window.location.pathname.includes(
                          camelcase(elm.name)
                        )
                          ? metaDataValue.branding?.primaryColor
                          : "#757575",
                      }}
                      key={`grid-menu${elm.name}`}
                    >
                      {generateIcon(paths[elm.name]?.icon, elm.name)}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </MenuList>
    );
  }

  function popperProfile() {
    return (
      <MenuList role="menu">
        <MenuItem>
          <Avatar />
          <span style={{ marginLeft: "20px", fontSize: "15px" }}>
            <p>{`${metaDataValue.userInfo?.firstName} ${metaDataValue.userInfo?.lastName}`}</p>
            <p style={{ fontSize: "12px", color: "#bdbdbd" }}>
              {metaDataValue.userInfo?.email}
            </p>
          </span>
        </MenuItem>
        <Divider />
        <MenuItem id="logout" onClick={logoutFn}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t("logout")}
        </MenuItem>
      </MenuList>
    );
  }

  const { t } = useTranslation();

  const handleClickNotification = (event) => {
    if (openNotification && openNotification.contains(event.target)) {
      setOpenNotification(null);
    } else {
      setOpenNotification(event.currentTarget);
    }
  };

  const handleCloseNotification = () => {
    setOpenNotification(null);
  };
  const handleClickProfile = (event) => {
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };

  function changeLanguage(params) {
    window.localStorage.setItem("Language", params);
    i18n.changeLanguage(params);
    handleCloseLanguage();
    location.reload();
  }

  const handleClickLanguage = (event) => {
    if (openLanguage && openLanguage.contains(event.target)) {
      setOpenLanguage(null);
    } else {
      setOpenLanguage(event.currentTarget);
    }
  };
  const handleCloseLanguage = () => {
    setOpenLanguage(null);
  };

  const logoutFn = async () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    dispatch(resetMetaData({}));
    logout();
    props.history.push("/auth/login");
  };

  const chunk = (arr, size) =>
    arr.reduce(
      (acc, e, i) => (
        i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc
      ),
      []
    );

  function generateIcon(Icon, elm) {
    console.log({ elm })
    return (
      <span>
        <Icon fontSize="medium" />
        <p className={classes.title}>{elm == 'Alarms Management' ? 'Alarms' : elm == 'Solution Management' ? 'Manage Solutions' : t(elm)}</p>
      </span>
    );
  }

  const paths = {
    Support: { path: "/support", icon: SupportAgentIcon },
    Solutions: { path: "/solutions", icon: WebIcon },
    Administration: { path: "/administration", icon: SupervisorAccountIcon },
    Settings: { path: "/settings", icon: SettingsIcon },
    Notifications: { path: "/notifications", icon: NotificationsActiveIcon },
    "Solution Management": { path: "/solutionManagement", icon: CodeIcon },
    "Solution Enablement": {
      path: "/solutionEnablement",
      icon: ImportExportIcon,
    },
    Simulation: {
      path: "/simulation",
      icon: GraphicEqIcon,
    },
    "Device Catalogue": {
      icon: RouterIcon,
    },
    "ROI Calculator": {
      icon: CalculateIcon,
      path: "/roiCalculator",
    },
    Analytics: {
      icon: AnalyticsIcon,
      path: "/analytics",
    },
    "Alarms Management": {
      icon: NotificationsActiveIcon,
      path: "/alarms-dashboard",
    },
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Search />
        <Popover
          icon={Person}
          component={popperProfile}
          white
          profile
          name="profile"
        />
        <Popover
          icon={LanguageIcon}
          component={popperLanguage}
          name="language"
          white
        />
        <Popover icon={AppsIcon} component={popperGrid} name="drawer" white />
      </div>
    </div>
  );
}
