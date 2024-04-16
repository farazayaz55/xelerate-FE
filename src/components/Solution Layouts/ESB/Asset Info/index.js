//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import Zoom from "@mui/material/Zoom";
//--------------MUI ICONS------------------------//
import RouterIcon from "@mui/icons-material/Router";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CancelIcon from "@mui/icons-material/Cancel";
//--------------EXTERNAL------------------------//
import { useGetNumOfDevicesQuery } from "services/devices";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Loader from "components/Progress";
import keys from "Keys";

export default function AssetCard(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [isShown, setIsShown] = React.useState(false);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const devicesRes = useGetNumOfDevicesQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    group: filtersValue.group.id,
  });

  useEffect(() => {
    if (devicesRes.isSuccess)
      dispatch(
        setFilter({
          noOfDevices:
            devicesRes.data?.payload && devicesRes.data.payload?.noOfDevices
              ? devicesRes.data.payload.noOfDevices
              : "0",
        })
      );
  }, [devicesRes.isFetching]);

  return (
    <Card
      style={{
        maxHeight: "220px",
        minHeight: "220px",
        maxWidth: "255px",
        minWidth: "255px",
      }}
    >
      <div style={{ padding: "10px" }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              color: "#bfbec8",
              fontSize: "15px",
            }}
          >
            <b>Asset Info</b>
          </p>
          <RouterIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "185px",
            width: "100%",
            gap: "10px",
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
                    onMouseEnter={() => setIsShown(true)}
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
                      <b>{filtersValue.group.name}</b>
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
                                group: { name: "All assets", id: "" },
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={`${keys.baseUrl}/servicecreator/asset/${props.asset.image}`}
                  style={{
                    maxWidth: "200px",
                    maxHeight:
                      filtersValue.group.name != "All assets"
                        ? "85px"
                        : "120px",
                  }}
                ></img>
              </div>

              <div
                style={{
                  backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`,
                  padding: "4px 6px 4px 6px",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{
                    color: metaDataValue.branding.secondaryColor,
                    fontSize: "12px",
                  }}
                >
                  <b>
                    {`${props.asset.name} (${
                      devicesRes.data?.payload &&
                      devicesRes.data.payload?.noOfDevices
                        ? devicesRes.data.payload.noOfDevices
                        : "0"
                    })`}
                  </b>
                </p>
              </div>
            </Fragment>
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </Card>
  );
}
