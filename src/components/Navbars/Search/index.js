import React, { Fragment, useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import { useGetDevicesQuery } from "services/devices";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Loader from "components/Progress";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Chip from "@mui/material/Chip";
import "./style.css";
import TuneIcon from "@mui/icons-material/Tune";
import DeviceFilter from "components/Filters/deviceFilter";


let timeout;
let currentTarget = null;
let value = "";

export default function BasicPopover(props) {
  const history = useHistory();
  const metaDataValue = useSelector((state) => state.metaData);
  const [filtering, setFiltering] = React.useState(false);
  const [search, setSearch] = useState("");
  const [solutuions, setSolutions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null)
  const [filterColumns, setFilterColumns] = React.useState(getSearchParam());

  let token = window.localStorage.getItem("token");
  const groupIds = []
  metaDataValue?.services.forEach(s => {
    if (s.group?.id) {
      groupIds.push(`${s.id}:${s.group?.id}`)
    }
  })
  const devicesApi = useGetDevicesQuery(
    {
      token,
      group: JSON.stringify(metaDataValue?.services.map((e) => e.id)),
      params: `&search=${searchParam}&searchFields=${JSON.stringify(filterColumns)}${groupIds.length ? `&associatedGroup=${JSON.stringify(groupIds)}` : ``}`,
    },
    { skip: !Boolean(anchorEl) }
  );

  function searchSolution() {
    return metaDataValue?.services.filter((service) => {
      return service.name.toLowerCase().includes(searchParam.toLowerCase());
    });
  }

  useEffect(() => {
    if (devicesApi.isSuccess && devicesApi.data?.payload?.data) {
      setDevices(devicesApi.data?.payload?.data);
      setSolutions(searchSolution());
    }
  }, [devicesApi.isFetching]);


  function devicesFn() {
    const newMap = { columns: [] }
    const layouts = metaDataValue.services.map((service) => service.solutionLayout)
    layouts.map((layout) => {
      layout.map.columns.forEach((data) => {
        if (!newMap.columns.includes(data)) {
          newMap.columns.push(data)
        }
      })
    })
    console.log("devices", newMap)
    return newMap
  }


  function getSearchParam() {
    let searchArr = ["name"];
      const layouts = metaDataValue.services.map((service) => service.solutionLayout)
      layouts.map((layout) => {
        let permission = layout.map.columns
        if (permission?.includes("metaTags")) {
          if (!searchArr.includes('metaTags'))
            searchArr.push("metaTags");
        }
        if (permission?.includes("deviceInfo")) {
          if (!searchArr.includes('firmware'))
            searchArr.push("firmware", "serialNo", "imei","imsi", "iccid", "msisdn", "internalId");
        }
      })
      return searchArr
  }


  const doneFilter = () => {
    // setFilterColumns(cols)
    setFiltering(false);
    // if (tempSearch) {
    //   dispatch(
    //     setFilter({
    //       search: tempSearch,
    //       searching: true,
    //       searchFields: filterColumns,
    //     })
    //   );
    // }
  };


  const handleSearch = (e) => {
    value = e.target.value;
    setSearch(e.target.value);
    currentTarget = e.currentTarget;
    if (timeout) clearTimeout(timeout);
    if (value != "") {
      timeout = setTimeout(function () {
        setAnchorEl(currentTarget);
        setSearchParam(value);
      }, 1000);
    }
  };

  // useEffect(() => {
  //   const timeout = setInterval(() => {
  //     console.log("FOCUS", document.getElementById("search-assetDashboard"));
  //     document.getElementById("search-assetDashboard").focus();
  //     document.getElementById("search-assetDashboard").value = "test";
  //   }, 1500);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [searchParam]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <div
        style={{
          margin: "0 10px",
          position: "relative",
          top: "10px",
        }}
      >
        <SearchOutlinedIcon
          style={{
            color: "#616161",
            position: "absolute",
            left: "8px",
            top: "5px",
            zIndex: "99",
          }}
        />
        <InputBase
          placeholder="Search..."
          id="search-assetDashboard"
          sx={{
            border: "1px solid rgb(215, 215, 215)",
            borderRadius: "10px",
            padding: "0px 30px",
            marginLeft: "0px",
            height: "31px",
            background: "white",
          }}
          value={search}
          onChange={handleSearch}
        />

        <TuneIcon
          sx={{
            position: "absolute",
            marginLeft: "-30px",
            marginTop: "4px",
            cursor: "pointer",
            color: "#616161",
          }}
          onClick={(e) => {
            setSearchAnchorEl(e.currentTarget);
            setFiltering(true);
          }}
        />

      </div>
      <span>
        <Popover
          id="assets"
          anchorEl={searchAnchorEl}
          // icon={KeyboardArrowDownIcon}
          open={filtering}
          onClose={doneFilter}
          name="assets"
          // anchorOrigin={{
          //   vertical: "bottom",
          //   horizontal: "left",
          // }}
          style={{ maxHeight: "500px" }}
        >
          <DeviceFilter
            filterColumns={filterColumns}
            setFilterColumns={setFilterColumns}
            layoutPermission={devicesFn()}
            doneFilter={doneFilter}
          />
        </Popover>
      </span>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          style: {
            borderRadius: "10px",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        style={{ marginTop: "20px", marginRight: "20px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "15px 25px",
            minWidth: "400px",
            position: "relative",
          }}
        >
          <p
            style={{
              color: "grey",
              cursor: "pointer",
              position: "absolute",
              top: "7px",
              right: "13px",
              fontSize: "13px",
            }}
            onClick={() => {
              setSearch("");
              setSearchParam("");
              setAnchorEl(null);
            }}
          >
            Clear
          </p>
          {devicesApi.isFetching ? (
            <Loader />
          ) : (
            <Fragment>
              {solutuions.length > 0 ? (
                <span>
                  <p style={{ fontWeight: "600" }}>Solutions</p>
                  <Divider style={{ marginBottom: "15px" }} />
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {solutuions.map((e) => (
                      <div
                        className="item"
                        onClick={() => {
                          history.push(`/solutions/${e.id}`);
                        }}
                      >
                        <p>{e.name}</p>
                      </div>
                    ))}
                  </div>
                </span>
              ) : null}

              {devices.length > 0 ? (
                <span>
                  <p style={{ fontWeight: "600" }}>Assets</p>
                  <Divider style={{ marginBottom: "15px" }} />
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {devices.map((e) => (
                      <div
                        className="item"
                        onClick={() => {
                          history.push(
                            `/solutions/${e.serviceId}/${e.internalId}/0`
                          );
                        }}
                      >
                        <p>{e.name}</p>
                        <Chip
                          label={
                            metaDataValue?.services.find((service) => {
                              return service.id == e.serviceId;
                            }).name
                          }
                          size="small"
                          style={{ color: "grey" }}
                        />
                      </div>
                    ))}
                  </div>
                </span>
              ) : null}

              {devices.length < 1 && solutuions.length < 1 ? (
                <p style={{ color: "grey", fontSize: "12px" }}>
                  No Solutions or Assets Found
                </p>
              ) : null}
            </Fragment>
          )}
        </div>
      </Popover>
    </div>
  );
}
