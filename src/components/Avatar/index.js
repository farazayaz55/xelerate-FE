import React from "react";
import Avatar from "@mui/material/Avatar";

export default function Catalogue(props) {
  return (
    <Avatar
      alt={props.title}
      style={{
        backgroundColor: props.color,
        height: props?.height ? props.height : "",
        width: props?.width ? props.width : "",
      }}
      imgProps={{
        style: props.zoomOut ? { height: "70%", width: "70%" } : {},
      }}
      src={props.image}
    >
      {props.Icon ? (
        <props.Icon
          style={{
            color: props.IconColor ? props.IconColor : "white",
            height: props?.fontSize ? props.fontSize : "",
            width: props?.fontSize ? props.fontSize : "",
          }}
        />
      ) : (
        <p
          style={{
            color: "white",
            fontSize: props?.fontSize ? props.fontSize : "",
          }}
        >
          <b>{props.title[0].toUpperCase()}</b>
        </p>
      )}
    </Avatar>
  );
}
