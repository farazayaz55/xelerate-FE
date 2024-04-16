//----------------CORE-----------------//
import React, { Fragment, useRef, useEffect } from "react";
//----------------EXTERNAL-----------------//
import mapboxgl from "!mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";
let marker;
export default function Map({setCoords, coords}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (mapContainer.current) {
      console.log('hereeeee',coords)
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: coords && coords.length ? coords : [-0.118092, 51.509865],
        zoom: 10,
      });
      if (marker) {
        marker.remove();
      }
      marker = new mapboxgl.Marker()
        .setLngLat(coords && coords.length ? coords : [-0.118092, 51.509865])
        .addTo(map.current);
      const geocoder = new MapboxGeocoder({
        // Initialize the geocoder
        accessToken: mapboxgl.accessToken, // Set the access token
        mapboxgl: mapboxgl, // Set the mapbox-gl instance
        marker: false, // Do not use the default marker style
      });

      map.current.addControl(geocoder);

      geocoder.on("result", (event) => {
        if (marker) {
          marker.remove();
        }
        map.current.flyTo({
          center: event.result.center,
        });
        marker = new mapboxgl.Marker()
          .setLngLat(event.result.center)
          .addTo(map.current);
        setCoords(event.result.center);
      });
      map.current.on("click", (e) => {
        if (marker) {
          marker.remove();
        }
        map.current.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
        });
        marker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current);
          setCoords([e.lngLat.lng, e.lngLat.lat]); 
      });
    }
  }, [mapContainer.current]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "50vh",
        borderRadius: "10px",
        marginTop: "20px",
      }}
    />
  );
}
