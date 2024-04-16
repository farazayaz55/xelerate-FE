import React, { useState } from "react";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import Backdrop from "@mui/material/Backdrop";

export default function Media() {
  const [show, setShow] = useState(!window.localStorage.getItem("dontShow"));
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={show}
    >
      <Card
        style={{
          position: "fixed",
          left: "0px",
          bottom: "0px",
          width: "100vw",
          padding: "15px",
          opacity: "0.9",
          zIndex: "9999",
        }}
      >
        <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <p style={{ fontWeight: "700", fontSize: "18px" }}>
            We value your privacy
          </p>
          <FontAwesomeIcon
            icon={faCookieBite}
            style={{
              color: "#c8c8c8",
              width: "20px",
              height: "20px",
            }}
          />
        </span>
        <p style={{ fontWeight: "300", fontSize: "14px", marginTop: "5px" }}>
          Xelerate platform uses cookies to enhance and personalize user
          experience. Any data collected through cookies is used only for the
          purposes of improving the functionality and performance of platform.
          By using this platform, you consent to its use of cookies for these
          purposes. If you do not wish to accept these cookies, you can adjust
          your browser settings to block or delete cookies. However, please note
          that some features may not function properly if cookies are disabled.
          If you have any questions or concerns, please contact us at
          support@invixible.com
        </p>

        <Button
          onClick={() => {
            setShow(false);
            window.localStorage.setItem("dontShow", "true");
          }}
          color="primary"
          variant="contained"
          style={{ float: "right", margin: "5px" }}
        >
          Dismiss
        </Button>
      </Card>
    </Backdrop>
  );
}
