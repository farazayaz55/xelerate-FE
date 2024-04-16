//--------------CORE------------------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import Zoom from "@mui/material/Zoom";
import { Tooltip, Avatar, IconButton} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//--------------MUI ICONS------------------------//
import RouterIcon from "@mui/icons-material/Router";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CancelIcon from "@mui/icons-material/Cancel";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Pin from "assets/img/location-pin.png";
//--------------EXTERNAL------------------------//
import { useGetNumOfDevicesQuery } from "services/devices";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Loader from "components/Progress";
import emitter from "Utilities/events";
import AssetInfoCard from "./AssetCard"
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

export default function AssetCardDefault(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const service = metaDataValue.services.find(s=>s.id == props.id)
  const [isShown, setIsShown] = React.useState(false);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [currentAsset, setCurrentAsset] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const TOTALASSETS = service.assets.length
  const devicesRes = useGetNumOfDevicesQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    params: `&MeasurementFilter=${filtersValue.measurement}&connected=${
      filtersValue.connection
    }&alarms=${filtersValue.alarms}&groupId=${
      filtersValue.group.id
    }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}`,
  });

  function callbackfn(payload) {
    dispatch(
      setFilter({
        noOfDevices: payload.message.noOfDevices,
        devicesCount: payload.message.devicesCount,
        totalDevices: filtersValue.totalDevices ? filtersValue.totalDevices : payload.message.noOfDevices 
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
        maxWidth: "255px",
        minWidth: "255px",
        position: "relative"
      }}
    >
      <div onMouseEnter={() => {setIsHovering(true)}} onMouseLeave={() => {setIsHovering(false)}} style={{ padding: "10px" }}>
        <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <p
              style={{
                color: "#bfbec8",
                fontSize: "15px",
              }}
            >
              <b>{TOTALASSETS > 1 ? `${TOTALASSETS} Asset Types` : "Asset Info"}</b>
            </p>
          </span>
          <RouterIcon style={{ color: "#bfbec8" }} />
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
            marginTop: "5px",
            justifyContent: "center",
            alignItems: "center",
            height: "185px",
            width: "100%",
            gap: "10px",
            position: "relative"
          }}
        >
          {!devicesRes.isLoading ? (
            <Fragment>
              {filtersValue.group.name != "All assets" ? (
                <Fragment>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                      if(service.group.name && filtersValue.group.id == service.group.id){
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
                      <b>{filtersValue.group.name || (service.group && service.group.name) || ""}</b>
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
                                group: service.group.name ? service.group : { name: "All assets", id: "" },
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
              {/* {props.service.assets.length > 1 ? 
              <div style={{
                height: filtersValue.group?.id ? "120px" : "140px",
                width: "100%",
                overflowY: "scroll",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
                {
                  props.service.assets.map((asset) => (
                    <div 
                      key={asset.id} 
                      style={{
                        padding: "3px",
                        paddingLeft: "8px",
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                        border: "2px solid",
                        borderRadius: "10px",
                        borderColor: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85, 85, 85)",
                        backgroundColor: isSelected(asset.id) ? "rgba(121, 195, 124, 0.1)" : "rgba(85, 85, 85, 0.1)"
                      }}
                    >
                      <img src={asset.image || Pin} width={40} height={40}/>
                      <p style={{display: "flex", color: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85, 85, 85)", fontSize: "13px", fontWeight: "bold", textOverflow: "ellipsis"}}>{`${asset.name} (${filtersValue.devicesCount?.[asset.id] || "0"})`}</p>
                    </div>
                  ))
                }
              </div> :
              (<> */}
              <AssetInfoCard asset={service.assets[currentAsset]} multipleAssets = {TOTALASSETS > 1 ? true : false}/>
              {/* </>)
              } */}
            </Fragment>
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </Card>
  );
}
