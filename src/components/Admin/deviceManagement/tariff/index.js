//-------------CORE-------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
//-------------MUI-------------//
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
//-------------MUI Icon-------------//
import InfoIcon from "@mui/icons-material/Info";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
//----------EXTERNAL COMPS--------//
import {
  useGetTariffQuery,
  useGetAggregatedTariffQuery,
} from "services/devices";
import Loader from "components/Progress";
import noData from "assets/img/no-data.png";

export default function Tariff({ id, name }) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString());
  const [oneMonthBefore, setOneMonthBefore] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
  );
  const [openPopup, setOpenPopup] = useState(false);
  const metaDataValue = useSelector((state) => state.metaData);

  const tariff = useGetTariffQuery(
    {
      token,
      id,
      params: `?withTotalPages=true&pageSize=8&currentPage=${page}`,
    },
    { skip: !openPopup }
  );

  const aggregated = useGetAggregatedTariffQuery(
    {
      token,
      id,
      params: `?dateTo=${currentDate}&dateFrom=${oneMonthBefore}`,
    },
    { skip: !openPopup }
  );

  useEffect(() => {
    if (tariff.isSuccess) {
      setTotalPages(tariff.data.payload.totalPages);
    }
  }, [tariff.isFetching]);

  const handlePageNext = () => {
    setPage(page + 1);
  };

  const handlePagePrevious = () => {
    setPage(page - 1);
  };

  function getClass(count) {
    if (count < 1) {
      return "A";
    } else if (count >= 1 && count <= 6) {
      return "B";
    } else if (count >= 7 && count <= 60) {
      return "C";
    } else if (count >= 61 && count <= 360) {
      return "D";
    } else if (count >= 361 && count <= 3600) {
      return "E";
    } else if (count > 3600) {
      return "F";
    }
  }

  return (
    <Fragment>
      <IconButton onClick={() => setOpenPopup(true)}>
        <MonetizationOnIcon color="secondary" />
      </IconButton>
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        PaperProps={{ style: { width: "500px" } }}
      >
        <DialogTitle>Class Mapping ({name})</DialogTitle>
        <DialogContent style={{ height: "400px", overflow: "hidden" }}>
          <Tooltip
            title={
              <div>
                <p>Class Mapping (Per Hour)</p>
                <p>{"A (>1)"}</p>
                <p>{"B (1-6)"}</p>
                <p>{"C (7-60)"}</p>
                <p>{"D (61-360)"}</p>
                <p>{"E (361-3600)"}</p>
                <p>{"F (>3600)"}</p>
              </div>
            }
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <InfoIcon
              style={{
                height: "18px",
                width: "18px",
                position: "absolute",
                right: "15px",
                color: "#555555",
                cursor: "pointer",
              }}
            />
          </Tooltip>
          <div style={{ position: "relative" }}>
            {tariff.isFetching || aggregated.isFetching ? (
              <div style={{ marginTop: "200px" }}>
                <Loader />
              </div>
            ) : (
              <>
                {tariff?.data?.payload?.data.length > 0 ? (
                  <>
                    <p>
                      Monthly Aggregation:
                      <span
                        style={{
                          color: metaDataValue.branding.primaryColor,
                          fontSize: "16px",
                          fontWeight: "900",
                          marginLeft: "10px",
                        }}
                      >
                        {getClass(aggregated?.data?.payload[0]?.count)}
                        <span
                          style={{
                            color: "grey",
                            marginLeft: "10px",
                            paddingBottom: "5px",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          Class
                        </span>
                      </span>
                    </p>
                    <div
                      style={{
                        height: "400px",
                        overflow: "auto",
                      }}
                    >
                      <List component="nav">
                        <Divider />
                        {tariff?.data?.payload?.data.map((elm, i) => {
                          let time = new Date(elm.time);
                          return (
                            <Fragment>
                              <ListItemButton>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  <p
                                    style={{
                                      color:
                                        metaDataValue.branding.primaryColor,
                                      fontSize: "16px",
                                      fontWeight: "900",
                                    }}
                                  >
                                    {getClass(elm.count)}
                                    <span
                                      style={{
                                        color: "grey",
                                        marginLeft: "10px",
                                        paddingBottom: "5px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                      }}
                                    >
                                      Class
                                    </span>
                                    <span
                                      style={{
                                        color: "grey",
                                        marginLeft: "10px",
                                        paddingBottom: "5px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      ({elm.count}/hour)
                                    </span>
                                  </p>
                                  <p>{`${time.toLocaleDateString(
                                    "en-GB"
                                  )} ${time.toLocaleTimeString()}`}</p>
                                </div>
                              </ListItemButton>
                              <Divider />
                            </Fragment>
                          );
                        })}
                      </List>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      marginBottom: "40px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "200px",
                        width: "200px",
                      }}
                    >
                      <img
                        style={{ maxWidth: "70%", maxHeight: "70%" }}
                        src={noData}
                      />
                    </div>
                    <p style={{ color: "#c8c8c8" }}>No transactions yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <IconButton
              size="medium"
              onClick={handlePagePrevious}
              disabled={page == 1}
            >
              <NavigateBeforeIcon fontSize="inherit" />
            </IconButton>
            <p>{page}</p>
            <IconButton
              size="medium"
              onClick={handlePageNext}
              disabled={page == totalPages}
            >
              <NavigateNextIcon fontSize="inherit" />
            </IconButton>
          </span>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
