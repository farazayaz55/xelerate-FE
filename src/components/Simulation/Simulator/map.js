import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Snackbar from "../../SnackBar";
import ClearIcon from "@mui/icons-material/Clear";
import Tooltip from "@mui/material/Tooltip";
import connector from "./connector";
import "./Map.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";

export default function App(props) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [snack, setSnack] = useState(false);
  const [snackText, setSnackText] = useState("");
  const [snackType, setSnackType] = useState("");
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-0.113802, 51.518255],
      zoom: 20,
    });
  }, []);

  function handleClear() {
    map.current.getSource("start").setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [],
          },
        },
      ],
    });

    map.current.getSource("line").setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
    });

    map.current.getSource("end").setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [],
          },
        },
      ],
    });
  }

  useEffect(() => {
    if (!map.current) return;
    var geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
    };

    var start = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [], // icon position [lng, lat]
          },
        },
      ],
    };

    var end = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [], // icon position [lng, lat]
          },
        },
      ],
    };

    var size = 80;

    var pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      onAdd: function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");
      },

      render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = "rgb(51,153,255," + (1 - t) + ")";
        context.fill();

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = "#3399ff";
        context.strokeStyle = "white";
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;

        map.current.triggerRepaint();

        return true;
      },
    };

    connector.on("setMap", (payload) => {
      map.current.getSource("start").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: payload[0],
            },
          },
        ],
      });

      map.current.getSource("line").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: payload,
            },
          },
        ],
      });

      map.current.getSource("end").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: payload[payload.length - 1],
            },
          },
        ],
      });
    });

    map.current.on("click", async function (e) {
      let loc = [e.lngLat.lng, e.lngLat.lat];
      let oldArr = map.current.getSource("start")._data.features[0].geometry
        .coordinates;
      if (oldArr.length < 1)
        map.current.getSource("start").setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [e.lngLat.lng, e.lngLat.lat],
              },
            },
          ],
        });
      else {
        await props.GetRouteMapbox(
          `${oldArr[0]},${oldArr[1]};${loc[0]},${loc[1]}`
        );
        let coordinates =
          props.res.getRouteMapbox.payload[0][0].geometry.coordinates;
        props.setRoute(coordinates);
        map.current.getSource("line").setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: coordinates,
              },
            },
          ],
        });
        map.current.getSource("end").setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [e.lngLat.lng, e.lngLat.lat],
              },
            },
          ],
        });
      }
    });

    map.current.on("load", function () {
      map.current.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });
      map.current.addSource("line", {
        type: "geojson",
        data: geojson,
      });

      map.current.addSource("start", {
        type: "geojson",
        data: start,
      });

      map.current.addSource("end", {
        type: "geojson",
        data: end,
      });

      map.current.addLayer({
        id: "E",
        type: "symbol",
        source: "end",
        // filter: ["has", "point_count"],
        paint: {
          "text-color": "#fff",
        },
        layout: {
          "text-field": "E",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.current.addLayer(
        {
          id: "EndingPoint",
          type: "circle",
          source: "end",
          paint: {
            "circle-color": "#bf3535",
            "circle-radius": 15,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        },
        "E"
      );

      map.current.addLayer({
        id: "S",
        type: "symbol",
        source: "start",
        // filter: ["has", "point_count"],
        paint: {
          "text-color": "#fff",
        },
        layout: {
          "text-field": "S",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.current.addLayer(
        {
          id: "StartingPoint",
          type: "circle",
          source: "start",
          paint: {
            "circle-color": "#004d00",
            "circle-radius": 15,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        },
        "S"
      );

      map.current.addLayer(
        {
          id: "line-animation",
          type: "line",
          source: "line",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": metaDataValue.branding.primaryColor,
            "line-width": 5,
            "line-opacity": 0.5,
          },
        },
        "EndingPoint",
        "StartingPoint"
      );
    });
  }, []);

  return (
    <div>
      <Snackbar
        type={snackType}
        open={snack}
        setOpen={handleClose}
        text={snackText}
        timeOut={3000}
      />
      <div
        ref={mapContainer}
        style={{ height: "400px", borderRadius: "10px" }}
      />
      <div
        style={{
          position: "absolute",
          top: "240px",
          right: "55px",
          zIndex: "1",
        }}
      >
        <Tooltip title="Clear" placement="left" arrow>
          <div
            style={{ marginBottom: "5px" }}
            className="button"
            onClick={handleClear}
          >
            <ClearIcon style={{ color: "#000000", fontSize: "17px" }} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
