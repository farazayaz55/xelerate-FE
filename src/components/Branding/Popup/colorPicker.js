import { Button } from "@mui/material";
import React from "react";
import { ChromePicker, CirclePicker } from "react-color";

export default function Test(props) {
  function handleChangeComplete(tempColor) {
    if (color == "primary") {
      props.setPrimaryColor(tempColor.hex);
    } else {
      props.setSecondaryColor(tempColor.hex);
    }
  }

  const [color, setColor] = React.useState("primary");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <span style={{ marginRight: "20px" }}>
        <span style={{ display: "flex", paddingBottom: "20px" }}>
          <Button
            style={{
              width: "110px",
              color: "white",
              backgroundColor: props.primaryColor,
              marginRight: "20px",
              boxShadow:
                color == "primary"
                  ? "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset"
                  : "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",

              border: color == "primary" ? "none" : "1px solid white",
            }}
            onClick={() => {
              setColor("primary");
            }}
          >
            Primary
          </Button>
          <Button
            style={{
              width: "110px",
              color: "white",
              backgroundColor: props.secondaryColor,
              boxShadow:
                color == "secondary"
                  ? "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset"
                  : "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",

              border: color == "secondary" ? "none" : "1px solid white",
            }}
            onClick={() => {
              setColor("secondary");
            }}
          >
            Secondary
          </Button>
        </span>
        <CirclePicker
          color={color == "primary" ? props.primaryColor : props.secondaryColor}
          onChangeComplete={handleChangeComplete}
          disableAlpha
        />
      </span>
      <span>
        <ChromePicker
          color={color == "primary" ? props.primaryColor : props.secondaryColor}
          onChangeComplete={handleChangeComplete}
          disableAlpha
        />
      </span>
    </div>
  );
}
