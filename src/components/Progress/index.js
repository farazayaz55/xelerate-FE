import * as React from "react";
import Box from "@mui/material/Box";
import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";

function FacebookCircularProgress(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  return (
    <Box sx={{ position: "relative" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: "#eeeeee",
        }}
        size={50}
        thickness={3}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: metaDataValue.branding.secondaryColor,
          animationDuration: "400ms",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={50}
        thickness={3}
        {...props}
      />
    </Box>
  );
}

export default function CustomizedProgressBars(props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        top: props.top,
        bottom: props.bottom,
      }}
    >
      <FacebookCircularProgress />
    </div>
  );
}
