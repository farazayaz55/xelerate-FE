import React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";
import { resetService } from "rtkSlices/ServiceCreatorSlice";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

export default function Devices(props) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const metaDataValue = useSelector((state) => state.metaData);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "20px",
          maxHeight: "calc(100vh - 310px)",
          minHeight: "calc(100vh - 310px)",
          overflowY: "scroll",
        }}
      >
        <CheckCircleOutlineIcon
          style={{
            height: "10rem",
            width: "10rem",
            color: metaDataValue.branding.secondaryColor,
          }}
        />
        <p
          style={{
            color: metaDataValue.branding.secondaryColor,
          }}
        >
          <b>
            {`${serviceValue.name} has been configured and added successfully.`}
          </b>
        </p>
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
        <Button
          color="secondary"
          onClick={() => {
            dispatch(resetService());
          }}
        >
          Reset
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            dispatch(resetService());
            props.history.push("/solutions/catalogue");
          }}
        >
          Home
        </Button>
      </div>
    </div>
  );
}
