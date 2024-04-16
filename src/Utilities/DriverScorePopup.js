//-----------------CORE---------------//
import React, { Fragment } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import driverScoreFormula from "../assets/img/driverScoreFormula.jpg"
import { Typography } from "@mui/material";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "max-content",
  maxWidth: "60vw",
  boxShadow: 24,
  padding: "20px",
  borderRadius: "15px 20px",
  height: "max-content",
  maxHeight: "65vh",
  overflow: 'auto'
};

export default function DriverScore({ setOpen }) {
  return (
    <Fragment>
      <Modal
        open={true}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                color: "darkgray",
                fontSize: "20px",
                textTransform: "capitalize",
              }}
            >
              <b>Driver Score</b>
            </p>
            <IconButton
              onClick={() => {
                setOpen(false);
              }}
              style={{ width: "20px", height: "20px" }}
            >
              <CloseIcon style={{ width: "15px", height: "15px" }} />
            </IconButton>
          </div>
          <div
            style={{
              lineHeight: 2,
              display: "flex",
              flexDirection: "column",
              margin: '10px 0px',
              fontSize: "14px",
              gap: "20px"
            }}
          > 
            <div style={{width: "100%", display: "flex", alignItems: "flex-start", gap: "60px", paddingLeft: "20px"}}>
              <div style={{width: "50%"}}>  
                <p>
                  Eco Driving function helps assess how safely employees are
                  driving by analyzing many parameters, assigning each trip a
                  score ranging from 0-10 points.
                </p>
                <p>Main parameters:</p>
                <ul style={{listStylePosition: 'inside', listStyleType: 'disc', paddingLeft: "10px"}}>
                  <li>Sharp acceleration</li>
                  <li>Hard braking</li>
                  <li>Sharp turning</li>
                </ul>
              </div>
              <div style={{width:'50%'}}>
                <p>
                  Eco score value can range from 10 (excellent) to 0.00 (bad):
                </p>
                <ul style={{listStylePosition: 'inside', listStyleType: 'none', paddingLeft: "10px"}}>
                  <li><span style={{fontWeight: "bold", fontSize: "18px"}}>{" - "}</span><span style={{color: "darkgreen", fontWeight: "bold"}}>Excellent</span> <span style={{fontWeight: "bold"}}>{" ( 8.00 – 10 ) "}</span> </li>
                  <li><span style={{fontWeight: "bold", fontSize: "18px"}}>{" - "}</span><span style={{color: "#ffbf00", fontWeight: "bold"}}>Moderate</span> <span style={{fontWeight: "bold"}}>{" ( 4.00 – 7.99 ) "}</span></li>
                  <li><span style={{fontWeight: "bold", fontSize: "18px"}}>{" - "}</span><span style={{color: "red", fontWeight: "bold"}}>Bad</span> <span style={{fontWeight: "bold"}}>{" ( 0 – 3.99 ) "}</span></li>
                </ul>
              </div>
            </div>
            <div>
              <p
                style={{
                  color: "darkgray",
                  fontSize: "18px",
                  textTransform: "capitalize",
                }}
              >
                <b>Formula for score calculation</b>
              </p>
              <div style={{width: "95%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: "10px", marginBottom: "20px", gap: "40px"}}>
                  <div>
                    <img style={{width:'260px', height:'150px'}} src={driverScoreFormula} />
                  </div>
                  <ul style={{listStylePosition: 'inside', listStyleType: "none", marginLeft: "10px", marginTop: "20px"}}>
                    <li><span style={{fontWeight:"bold"}}>Eallowed</span> - ECO Score Allowed Events</li>

                    <li><span style={{fontWeight:"bold"}}>d</span> - trip distance traveled in KM</li>

                    <li><span style={{fontWeight:"bold"}}>Egen</span> - Total generated events</li>
                  </ul>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </Fragment>
  );
}
