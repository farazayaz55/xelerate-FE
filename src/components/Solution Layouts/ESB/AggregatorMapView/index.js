//-----------------CORE---------------//
import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import AssetViews from "../Asset Views";
import { useSelector, useDispatch } from "react-redux";

export default function AggregatorMapView(props) {
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    console.log("Hereee")
  }, [props])

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const { t } = useTranslation();

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  // useEffect(() => {
  //   if (filtersValue.expanded.length > 0) {
  //     let id = filtersValue.selectedNodeChain[
  //       filtersValue.selectedNodeChain.length - 1
  //     ].split(":")[0];
  //     if (id && parseInt(id) != 0) {
  //       setGroupId(id);
  //     }
  //   } else {
  //     setGroupId("");
  //   }
  // }, [filtersValue]);

  function getPermission(chk) {
    let value;
    props.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  //   function chkGroup() {
  //     let tab;
  //     let admin = metaDataValue.apps.find((m) => m.name == "Administration");
  //     if (admin) tab = admin.tabs.find((m) => m.name == "Group Management");
  //     if (tab) return true;
  //     else return false;
  //   }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 12rem)",
          marginTop: "10px",
        }}
      >
        <span
          style={{
            display: "flex",
            gap: "20px",
            flexDirection:
              window.localStorage.getItem("Language") == "ar"
                ? "row-reverse"
                : "row",
            width: "100%",
            height: "100%",
          }}
        >
          <AssetViews
            image={props.assets[0].image}
            sensors={props.sensors}
            group={props.group}
            asset={props.assets[0]}
            history={props.history}
            link={props.link}
            toggleDrawer={toggleDrawer}
            alarms={getPermission("Alarms")}
            dataPointThresholds={props.dataPointThresholds}
            layout={props.layout}
            open={true}
            minHeight={300}
            height={350}
            showMapFullScreen={false}
          />
        </span>
      </div>
    </Fragment>
  );
}
