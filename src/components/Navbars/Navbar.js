//----------------CORE-----------------//
import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//----------------Assets-----------------//
import AdminNavbarLinks from "./NavbarLinks.js";
import InvixibleLogo from "assets/img/sideLogo.png";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import MenuList from "@mui/material/MenuList";
import Avatar from "@mui/material/Avatar";
//----------------MUI ICONS-----------------//
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

//----------------EXTERNAL COMPONENTS-----------------//
import Popover from "components/Popover";
import keys from "Keys";
import { setServices } from "rtkSlices/metaDataSlice";
import { useUploadBrandingMutation } from "services/branding";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";

export default function Navbar(props) {
  console.log("NAVBAR PROPS", props)
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const [uploadBranding, uploadResult] = useUploadBrandingMutation();
  const path = window.location.pathname;
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding?.primaryColor || "#3399ff")
  );

  const { t } = useTranslation();

  const useStyles = makeStyles({
    icons: { marginTop: "27px" },
    item: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      margin: "10px",
      padding: "10px",
      borderRadius: "10px",
      "&:hover": {
        display: "flex",
        margin: "10px",
        padding: "10px",
        borderRadius: "10px",
        backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.4)`,
        cursor: "pointer",
      },
    },
    noSolutionContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      padding: "20px",
    },
    codeIcon: {
      width: "30px",
      height: "30px",
      color: "#555555",
    },
    avatar: {
      backgroundColor: metaDataValue.branding?.primaryColor,
    },
    menuContainer: {
      marginLeft: "15px",
      position: "relative",
      width: "300px",
    },
    name: {
      fontSize: "15px",
      color: "black",
    },
    noSolution: { fontSize: "13px", color: "#555555" },
    description: {
      fontSize: "11px",
      marginLeft: "1px",
      color: "black",
    },
    divider: {
      marginLeft: "10px",
      marginRight: "10px",
    },
    linkContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    link: {
      margin: "5px",
      fontSize: "12px",
      color: "black",
    },
    appBar: {
      backgroundColor: `${keys?.company == "Rensair" ? "#2E3039" : "white"
        } !important`,
      boxShadow:
        "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px !important",
    },
    toolBar: {
      padding: "0 !important",
      gap: "10px",
    },
    logoContainer: {
      minWidth: "150px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 20px",
    },
    logo: { maxHeight: "50px" },
    header: {
      backgroundColor: metaDataValue.branding?.primaryColor,
      width: "100%",
      height: "64px",
      clipPath: "polygon(50px 0, 100% 0, 100% 100%, 0 100%)",
    },
    title: {
      color: "white",
      fontSize: "30px",
    },
    titleDiv: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      top: "20px",
      paddingRight: "200px",
    },
    links: {
      position: "absolute",
      top: "8px",
      right: "10px",
    },
    marginLeft: {
      marginLeft: "10px",
    },
    kebabPinIcon: {
      marginRight: "10px",
      cursor: "pointer",
      "&:hover": {
        fill: "grey",
      },
    },
  });

  const classes = useStyles(props);

  function makeTitle() {
    var name;
    props.routes.map((prop) => {
      if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
        name = prop.name;
      }
      return null;
    });
    return name;
  }

  const slicedServices = () => {
    let pinnedSolutions = metaDataValue.services.filter((v) => v.pinned);
    if (pinnedSolutions.length) {
      return pinnedSolutions.length <= 5
        ? [
          ...pinnedSolutions.sort((a, b) => a.pinned - b.pinned).reverse(),
          ...props.services
            .filter((s) => !s.pinned)
            .slice(0, 5 - pinnedSolutions.length),
        ]
        : pinnedSolutions.sort((a, b) => a.pinned - b.pinned).reverse().slice(0, 5);
    } else {
      return props.services.slice(0, 5);
    }
  };

  const onUnpin = async (id) => {
    let tempServices = JSON.parse(JSON.stringify(props.services));
    delete tempServices.find((s) => s.id == id).pinned;
    dispatch(setServices(tempServices));
    // let pinnedSolutions = [];
    // tempServices.filter(t=>t.pinned).forEach(p=>{
    //   pinnedSolutions.push({solution:p.id,pin:p.pinned})
    // })
    // let body = {
    //   pinnedSolutions
    // }
    // let updatedSettings = await uploadBranding({ token, body, type:'put', user:"true" })
    // if (updatedSettings.data?.success) {
    //   dispatch(setServices(tempServices))
    // }
    // else if (updatedSettings.error) {
    //   showSnackbar("Settings", updatedSettings.error.data?.message, "error", 1000);
    // }
  };

  function PopperSolutions() {
    return (
      <div style={{ minWidth: "200px" }}>
        {props.services.length == 0 ? (
          <div className={classes.noSolutionContainer}>
            <CodeOffIcon className={classes.codeIcon} />
            <p className={classes.noSolution}>No solutions registered</p>
          </div>
        ) : (
          <MenuList>
            {slicedServices().map((elm, i) => (
              <div>
                <div
                  id={`pinned-solution-${elm.id}`}
                  key={`solutions-menu-${elm.name}`}
                  style={{ display: "flex", justifyContent: "space-between" }}
                  onClick={() => props.history.push(`/solutions/${elm.path}`)}
                >
                  <div className={classes.item}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: metaDataValue.branding?.primaryColor,
                        }}
                        src={elm.image}
                      >
                        {elm.name[0].toUpperCase()}
                      </Avatar>
                      <div className={classes.menuContainer}>
                        <p className={classes.name}>
                          <strong>{elm.name}</strong>
                        </p>
                        <p className={classes.description}>{elm.description}</p>
                      </div>
                    </span>
                    {elm.pinned ? (
                      <PushPinOutlinedIcon
                        fontSize="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpin(elm.id);
                        }}
                        className={classes.kebabPinIcon}
                      />
                    ) : null}
                  </div>
                </div>
                <Divider className={classes.divider} />
              </div>
            ))}
            <div className={classes.linkContainer}>
              <Link to={"/solutions/catalogue"}>
                <p className={classes.link} id="view-all">
                  view all
                </p>
              </Link>
            </div>
          </MenuList>
        )}
      </div>
    );
  }

  return (
    <Fragment>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolBar}>
          <div className={classes.marginLeft}>
            <Popover
              icon={MoreVertIcon}
              component={PopperSolutions}
              white={keys?.company == "Rensair"}
            />
          </div>
          <div className={classes.logoContainer}>
            <Link
              id="solution-img"
              to={
                metaDataValue.services.length == 1
                  ? `/solutions/${metaDataValue.services[0].id}`
                  : "/solutions/"
              }
            >
              <img
                className={classes.logo}
                id="home"
                src={
                  metaDataValue.branding?.logo
                    ? metaDataValue.branding?.logo
                    : InvixibleLogo
                }
              />
            </Link>
          </div>

          <div className={classes.header}>
            <div className={classes.titleDiv}>
              <p className={classes.title}>{props?.title || makeTitle()}</p>
            </div>
          </div>
          <div className={classes.links}>
            <AdminNavbarLinks history={props.history} />
          </div>
        </Toolbar>
      </AppBar>
    </Fragment>
  );
}
