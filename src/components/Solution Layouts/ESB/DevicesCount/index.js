//--------------CORE------------------------//
import React, { Fragment, useEffect, useState } from "react";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import EVCharger from "../../../../assets/icons/evcharger.png";
import SolarPanel from "../../../../assets/icons/solar-panel.png";
import DerProduction from "assets/img/der-production.png";
import BarChart from "./BarChart";

export default function DevicesCount({assetCounts}) {
  const [data, setData] = useState([
      {
        "device": "Others",
        "connected": 0,
        "disconnected": 0,
      },
      {
        "device": "Inverter",
        "connected": 0,
        "disconnected": 0,
      },
      {
        "device": "EV Charger",
        "connected": 0,
        "disconnected": 0,
      },
    ])

  function calcWidth(value, total) {
    return (Math.ceil(value / total) * 100).toString() + "%";
  }

  useEffect(() => {
    console.log({assetCounts})
    setData([
      {
        "device": "Others",
        "connected": assetCounts?.other?.connected || 0,
        "disconnected": assetCounts?.other?.disconnected || 0,
      },
      {
        "device": "Inverter",
        "connected": assetCounts?.inverter?.connected || 0,
        "disconnected": assetCounts?.inverter?.disconnected || 0,
      },
      {
        "device": "EV Charger",
        "connected": assetCounts?.evCharger?.connected || 0,
        "disconnected": assetCounts?.evCharger?.disconnected || 0,
      },
    ])
  }, [assetCounts])

  return (
    <div style={{width:'90%'}}>
      <div style={{ display: "flex"}}>
        <div style={{display: "flex", width: "100%"}}>
          <div style={{ height: "100%", width: "35px", lineHeight: "3.2", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div>
              <img src={EVCharger} style={{ width: "35px", height: "35px" }} />
            </div>
            <div>
              <img src={SolarPanel} style={{ width: "35px", height: "35px" }} />
            </div>
            <div>
              <img src={DerProduction} style={{ width: "35px", height: "35px" }} />
            </div>
          </div>
          {/* <div
            style={{
              border: "1px solid rgb(240, 240, 240)",
              borderRadius: "2px",
              padding: "7px",
              height: "100%",
              width: "70%",
            }}
          >
            <div style={{ display: "flex" }}>
              <div
                style={{
                  width: calcWidth(assetCounts.evCharger.disconnected || 0, assetCounts.totalCount),
                  display: "flex",
                  justifyContent: "center",
                  border: "1px solid #555555",
                  borderRadius: "2px",
                  padding: "7px",
                  fontWeight: "bold",
                  backgroundColor: "rgb(85,85,85,0.1)",
                }}
              >
                {assetCounts.evCharger.disconnected || 0}
              </div>
              <div
                style={{
                  width: calcWidth(assetCounts.evCharger.connected || 0, assetCounts.totalCount),
                  display: "flex",
                  justifyContent: "center",
                  border: "1px solid #5fb762",
                  borderRadius: "2px",
                  padding: "7px",
                  fontWeight: "bold",
                  backgroundColor: "rgb(95,183,98,0.1)",
                }}
              >
                {assetCounts.evCharger.connected || 0}
              </div>
            </div>
            <div style={{ display: "flex", marginTop: "6px" }}>
              <div
                style={{
                  width: calcWidth(assetCounts.inverter.disconnected || 0, assetCounts.totalCount),
                  display: "flex",
                  justifyContent: "center",
                  border: "1px solid #555555",
                  borderRadius: "2px",
                  padding: "7px",
                  fontWeight: "bold",
                  backgroundColor: "rgb(85,85,85,0.1)",
                }}
              >
                {assetCounts.inverter.disconnected || 0}
              </div>
              <div
                style={{
                  width: calcWidth(assetCounts.inverter.connected || 0, assetCounts.totalCount),
                  display: "flex",
                  justifyContent: "center",
                  border: "1px solid #5fb762",
                  borderRadius: "2px",
                  padding: "7px",
                  fontWeight: "bold",
                  backgroundColor: "rgb(95,183,98,0.1)",
                }}
              >
                {assetCounts.inverter.connected || 0}
              </div>
            </div>
          </div> */}
          <div style={{width: "100%", height: "160px", overflowY: "hidden"}}>
            <div style={{width: "100%", height: "180px"}}>
              <BarChart
                name="assets-count-bar"
                data = {data} 
              />
            </div>
          </div>
        </div>
        <div style={{ height: "100%", with: "20%", alignSelf: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "19px", color: "black" }}>
            {assetCounts.totalCount}
          </div>
          <div>DERs</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center" }}>
        {[
            {
              name: "disconnected",
              fade: "rgb(85,85,85,0.1)",
              color: "#555555",
              label: "Disconnected",
            },
          {
            name: "connected",
            label: "Connected",
            color: "#5fb762",
            fade: "rgb(95,183,98,0.1)",
          },
        ].map((elm) => (
          <div
            style={{
              backgroundColor: elm.fade,
              padding: "7px 8px",
              borderRadius: "10px",
            }}
          >
            <p
              style={{
                color: elm.color,
                fontSize: "10px",
              }}
            >
              <b>{elm.label} </b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
