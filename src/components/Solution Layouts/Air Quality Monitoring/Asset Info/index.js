//--------------CORE------------------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import { Tooltip, Avatar, Zoom, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//--------------MUI ICONS------------------------//
import AssetInfoImage from "assets/icons/info.png";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CancelIcon from "@mui/icons-material/Cancel";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
//--------------EXTERNAL------------------------//
import { useGetNumOfDevicesQuery } from "services/devices";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Loader from "components/Progress";
import emitter from "Utilities/events";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import AssetInfoCard from "./AssetInfoCard";

export default function AssetCard(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [isShown, setIsShown] = React.useState(false);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [currentAsset, setCurrentAsset] = useState(0)
  const TOTALASSETS = props.service.assets.length
  const devicesRes = useGetNumOfDevicesQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    params: `&MeasurementFilter=${filtersValue.measurement}&connected=${
      filtersValue.connection
    }&alarms=${filtersValue.alarms}&groupId=${
      filtersValue.group.id
    }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}`,
  });
  const [isHovering, setIsHovering] = useState(false)

  function callbackfn(payload) {
    dispatch(
      setFilter({
        noOfDevices: payload.message.noOfDevices,
        devicesCount: payload.message.devicesCount
      })
    );
  }

  useEffect(() => {
    emitter.on("solution?deviceDashboardAssetCount", callbackfn);
    return () => {
      emitter.off("solution?deviceDashboardAssetCount", callbackfn);
    };
  }, []);

  useEffect(() => {
    if (devicesRes.isSuccess)
      dispatch(
        setFilter({
          noOfDevices:
            devicesRes.data?.payload && devicesRes.data.payload?.noOfDevices
              ? devicesRes.data.payload.noOfDevices
              : "0",
            devicesCount: devicesRes.data?.payload && devicesRes.data?.payload.devicesCount ? devicesRes.data?.payload.devicesCount : {} 
        })
      );
  }, [devicesRes.isFetching]);

  return (
    <Card
      style={{
        maxHeight: "240px",
        minHeight: "240px",
        height: "100%",
        maxWidth: "255px",
        minWidth: "255px",
        position: "relative"
      }}
    >
      <div onMouseEnter={() => {setIsHovering(true)}} onMouseLeave={() => {setIsHovering(false)}} style={{ padding: "10px"}}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "flex",
              gap: "15px",
              flex: 1,
              alignItems: "center",
              marginLeft: "5px",
            }}
          >
            <img
              src={AssetInfoImage}
              style={{ maxHeight: "16px", maxWidth: "20px" }}
            />
            <p
              style={{
                color: "black",
                fontSize: "14px",
                letterSpacing: "1px",
              }}
            >
              <b>{TOTALASSETS > 1 ? `${TOTALASSETS} ASSET TYPES` : "ASSET INFO"}</b>
            </p>
          </span>
          {isHovering || 
            filtersValue.assetTypes!==null || 
            filtersValue.measurement != "" ||
            filtersValue.connection != "" ||
            filtersValue.metaTags != "" ||
            filtersValue.alarms.length > 0 ? 
            <span style={{position: "absolute", top: "10px", right: "10px"}}>
            <Tooltip
              title="Filter"
              placement="bottom"
              arrow
              TransitionComponent={Zoom}
            >
              <Avatar
                style={{
                  backgroundColor:
                    filtersValue.assetTypes !== null ||
                    filtersValue.measurement != "" ||
                    filtersValue.connection != "" ||
                    filtersValue.metaTags != "" ||
                    filtersValue.alarms.length > 0
                      ? metaDataValue.branding.secondaryColor
                      : "white",
                  height: "28px",
                  width: "28px",
                  cursor: "pointer",
                  transition: "0.5s",
                  marginLeft: "10px",
                  border: "1px solid rgb(215, 215, 215)",
                }}
                onClick={() => {
                  dispatch(setFilter({ view: "1", open: true }));
                  props.toggleDrawer();
                }}
              >
                <FontAwesomeIcon
                  icon={faFilter}
                  style={{
                    color:
                      filtersValue.measurement != "" ||
                      filtersValue.connection != "" ||
                      filtersValue.metaTags != "" ||
                      filtersValue.alarms.length > 0
                        ? "white"
                        : "#616161",
                    height: "12px",
                    width: "12px",
                  }}
                />
                </Avatar>
              </Tooltip>
          </span> : null}
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: "10px",
          }}
        >
          {!devicesRes.isFetching ? (
            <Fragment>
              {filtersValue.group.name != "All assets" ? (
                <Fragment>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: TOTALASSETS > 1 ? "15px": "2px",
                      gap: "5px",
                      backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`,
                      padding: "4px 6px 4px 6px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      dispatch(setFilter({ view: "2" }));
                      props.toggleDrawer();
                    }}
                    onMouseEnter={() => {
                      if(props.service.group.name && filtersValue.group.id == props.service.group.id){
                        setIsShown(false)
                      }
                      else{
                        setIsShown(true)
                      }
                    }}
                    onMouseLeave={() => setIsShown(false)}
                  >
                    <AccountTreeIcon
                      color="secondary"
                      style={{ height: "15px", width: "15px" }}
                    />
                    <p
                      style={{
                        color: metaDataValue.branding.secondaryColor,
                        fontSize: "12px",
                      }}
                    >
                      <b>{filtersValue.group.name || (props.service.group && props.service.group.name) || ""}</b>
                    </p>
                    {isShown ? (
                      <Zoom in={isShown}>
                        <CancelIcon
                          color="secondary"
                          style={{ height: "15px", width: "15px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              setFilter({
                                group: props.service.group.name ? props.service.group : { name: "All assets", id: "" },
                              })
                            );
                            setIsShown(false);
                          }}
                        />
                      </Zoom>
                    ) : null}
                  </div>
                </Fragment>
              ) : null}
              {TOTALASSETS > 1 ? (
                <>
                  <div style={{position: "absolute", top: "37.5%", left: "5px"}}>
                    <IconButton 
                      disabled={currentAsset == 0} 
                      onClick={() => {setCurrentAsset(currentAsset-1)}}
                    >
                      <ArrowBackIos/>
                    </IconButton>
                  </div>
                  <div style={{position: "absolute", top: "37.5%", right: "5px"}}>
                    <IconButton 
                      disabled={currentAsset == TOTALASSETS-1}
                      onClick={() => {setCurrentAsset(currentAsset+1)}}
                    >
                      <ArrowForwardIos/>
                    </IconButton>
                  </div>
                </>
              ) : null }
              {/* // <div style={{
              //   height: filtersValue.group?.id ? "140px" : "160px",
              //   width: "100%",
              //   overflowY: "scroll",
              //   padding: "10px",
              //   display: "flex",
              //   flexDirection: "column",
              //   gap: "10px",
              // }}>
              //   <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%"}}>
              //     <IconButton>
              //       <ArrowBackIos />
              //     </IconButton>
              //     <div>
              //       Asset Card
              //     </div>
              //     <IconButton>
              //       <ArrowForwardIos />
              //     </IconButton>
              //   </div>
                // {/* {
                //   props.service.assets.map((asset) => (
                //     <div 
                //       key={asset.id} 
                //       style={{
                //         padding: "3px",
                //         paddingLeft: "8px",
                //         display: "flex",
                //         gap: "15px",
                //         alignItems: "center",
                //         border: "2px solid",
                //         borderRadius: "10px",
                //         borderColor: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85, 85, 85)",
                //         backgroundColor: isSelected(asset.id) ? "rgba(121, 195, 124, 0.1)" : "rgba(85, 85, 85, 0.1)"
                //       }}
                //     >
                //       <img src={asset.image || Pin} width={40} height={40}/>
                //       <p style={{display: "flex", color: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85, 85, 85)", fontSize: "13px", fontWeight: "bold", textOverflow: "ellipsis"}}>{`${asset.name} (${filtersValue.devicesCount?.[asset.id] || "0"})`}</p>
                //     </div>
                //   ))
                // } */}
              <AssetInfoCard asset={props.service.assets[currentAsset]} multipleAssets = {TOTALASSETS > 1 ? true : false}/>
            </Fragment>
          ) : (
            <div
              style={{
                marginTop: "30%",
              }}
            >
              <Loader />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
