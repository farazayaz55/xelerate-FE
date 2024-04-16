//----------------CORE-----------------//
import React, { Fragment, useEffect, useState } from "react";
import { setService, resetService } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
//----------------MUI-----------------//
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ColorSpectrum from "./Color spectrum";
import CustomAttributes from "./Custom Attributes";
import VanishingSolution from "./Vanishing Solution";

import DeviceMap from "./Device Map";
export default function Catalogue(props) {
  const dispatch = useDispatch();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const handleChangeLocation = (val) => {
    console.log({ val });
    dispatch(
      setService({
        defaultLocation: val,
      })
    );
  };

  useEffect(() => {
  console.log('serviceValue',serviceValue)
  }, [serviceValue]);
  return (
    <Fragment>
      <div
        style={{
          padding: "10px 5px",
          maxHeight: "calc(100vh - 286px)",
          minHeight: "calc(100vh - 286px)",
          overflowY: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                // width: "500px",
                width: "65%",
              }}
            >
              <div style={{ display: "flex", gap: "30px" }}>
                <div style={{ width: "50%" }}>
                  <VanishingSolution />
                  <p
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Color Spectrum</b>
                  </p>
                  <Divider />
                  <ColorSpectrum />
                  <p
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Trend Default Settings</b>
                  </p>
                  <Divider />
                  <FormControl fullWidth style={{ marginTop: "20px" }}>
                    <InputLabel>Default Datapoint</InputLabel>
                    <Select
                      fullWidth
                      label="Default Datapoint"
                      name="defaultDatapoint"
                      value={serviceValue.trend?.defaultDatapoint?.id || ""}
                      onChange={(e) => {
                        console.log(serviceValue.datapoints.find(d=>d.id == e.target.value));
                        dispatch(
                          setService({
                            trend: {
                              ...serviceValue.trend,
                              defaultDatapoint:{id: e.target.value, name: serviceValue.datapoints.find(d=>d.id == e.target.value).name} ,
                            },
                          })
                        );
                      }}
                    >
                      {serviceValue.datapoints.map((e) => (
                        <MenuItem value={e.id}>{e.friendlyName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth style={{ marginTop: "20px" }}>
                    <InputLabel>Default Aggregation</InputLabel>
                    <Select
                      fullWidth
                      label="Default Aggregation"
                      name="defaultAggregation"
                      value={serviceValue.trend?.defaultAggregation || ""}
                      onChange={(e) => {
                        console.log({ e });
                        dispatch(
                          setService({
                            trend: {
                              ...serviceValue.trend,
                              defaultAggregation: e.target.value,
                            },
                          })
                        );
                      }}
                    >
                     <MenuItem value="min">Minimum</MenuItem>
                     <MenuItem value="max">Maximum</MenuItem>
                     <MenuItem value="readingPerHour">Average</MenuItem>
                     <MenuItem value="sumOfReadings">Sum</MenuItem>
                    </Select>
                  </FormControl>
                  <p
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Custom Attributes</b>
                  </p>
                  <Divider />
                  <FormControl fullWidth style={{ marginTop: "20px" }}>
                    <InputLabel>Prioritized Attribute</InputLabel>
                    <Select
                      fullWidth
                      label="Prioritized Attribute"
                      value={serviceValue.map.identifier}
                      onChange={(e) => {
                        dispatch(
                          setService({
                            map: {
                              ...serviceValue.map,
                              identifier: e.target.value,
                            },
                          })
                        );
                      }}
                    >
                      <MenuItem value="default">[None]</MenuItem>
                      {serviceValue.persist.meta.map((e) => (
                        <MenuItem value={e._id}>{e.key}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <CustomAttributes
                    id={props.id}
                    dashboard={true}
                    edit={true}
                  />
                </div>
                <div style={{ width: "50%" }}>
                  <div
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Default Location</b>
                    <Divider />
                    <DeviceMap
                      setCoords={handleChangeLocation}
                      coords={serviceValue.defaultLocation}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          top: "10px",
        }}
      >
        {props.edit ? (
          <Button
            color="error"
            id="cancel"
            onClick={() => {
              dispatch(resetService());
              props.setSelected(null);
            }}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          color="secondary"
          onClick={() =>
            dispatch(
              setService({
                page: 4,
              })
            )
          }
        >
          Back
        </Button>
        <Button
          color="secondary"
          id="next"
          onClick={() => {
            dispatch(
              setService({
                page: 6,
              })
            );
          }}
        >
          Next
        </Button>
        {props.edit ? (
          <Button color="secondary" id="save" onClick={props.handleSave}>
            Save
          </Button>
        ) : null}
      </div>
    </Fragment>
  );
}
