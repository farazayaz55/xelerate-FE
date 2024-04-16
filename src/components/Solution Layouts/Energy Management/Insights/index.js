//-----------------CORE---------------//
import React, { Fragment } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import EnergyOn from "assets/icons/energy-on.png";
import Home from "assets/img/home.png";
import School from "assets/img/schools.png";
import Tons from "assets/img/tons.png";
import Trees from "assets/img/trees.png";
import ElectricCar from "assets/img/electric-car.png";
import { Divider } from "@mui/material";
import DollarOn from "assets/icons/dollarOn.png";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckIcon from '@mui/icons-material/Check';
import LinkIcon from '@mui/icons-material/Link';
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "900px",
  boxShadow: 24,
  padding: "20px",
  borderRadius: "15px 20px",
  height: "430px",
};

export default function Insights({ open, setOpen, days, unit, globalEnergy }) {
  const [openPopup, setOpenPopup] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  function calculate(key) {
    let factors = {
      co2: 0.433,
      cars: 0.0225,
      homes: 0.04,
      schools: 0.01,
    };
    return Math.floor(globalEnergy?.energy * factors[key]);
  }
  

  function getReferences() {
    return (
      <ul style={{ fontSize: "13px", listStyleType:'disc', marginLeft:'20px' }}>
        <li>
          CO2: as per USA Environmental Protection Agency (EPA) avg CO2
          emissions from electricity generated in US in 2020 was approximately
          0.4295kg per kilowatt-hour
        </li>
        <li>
          Trees to offset CO2: as per USA Environmental Protection Agency (EPA)
        </li>
        <li>
          Homes powered: as per USA Environmental Protection Agency (EPA), 1kWh
          can power 0.0001 homes for one year.
        </li>
        <li>
          Schools powered: a very rough estimate assumes one primary school is
          10 times more energy hungry than a domestic house due to area,
          occupancy and equipment
        </li>
        <li>
          Electrical Vechicles charged: Typical small vehicles range from
          30-50kWh. For this calculation 40kWh is assumed
        </li>
      </ul>
    );
  }

  return (
    <Fragment>
      <Modal
        open={open}
        onClose={() => {
          setCopied(false)
          setOpen(false)
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p
              style={{
                color: "#bfbec8",
                fontSize: "17px",
                textTransform: "capitalize",
              }}
            >
              <b>{`Sustainability Insights ${
                openPopup ? "- References" : ""
              }`}</b>
            </p>
            <IconButton
              onClick={() => {
                setCopied(false)
                setOpen(false)
              }}
              style={{ width: "20px", height: "20px" }}
            >
              <CloseIcon style={{ width: "15px", height: "15px" }} />
            </IconButton>
          </div>

          {openPopup ? (
            <div
              style={{
                lineHeight: 2,
                display: "flex",
                alignItems: "center",
                height: "80%",
              }}
            >
              {getReferences()}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  display: "flex",
                  alignItems:'center',
                  cursor:'pointer'
                }}
                onClick={() => setOpenPopup(false)}
              >
                <ArrowBackIosNewIcon
                  sx={{ color: "lightgrey", cursor: "pointer", width:'15px',height:'15px' }}
                  
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "lightgrey",
                    marginLeft: "8px",
                  }}
                >
                  Back to Insights
                </span>
              </div>
            </div>
          ) : (
            <Fragment>
              <div style={{ display: "flex", margin: "25px auto" }}>
                <div
                  style={{
                    textAlign: "end",
                    width: "50%",
                    fontSize: "17px",
                    color: "grey",
                  }}
                >
                  Energy Consumed over {days} day(s) period
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ display: "flex" }}>
                    <img
                      src={EnergyOn}
                      style={{ width: "45px", height: "45px" }}
                    />
                    <div style={{ marginTop: "4px" }}>
                      <div
                        style={{
                          fontSize: "25px",
                          color: "#444",
                          fontWeight: "bold",
                        }}
                      >
                        {globalEnergy?.energy.toLocaleString()}
                      </div>
                      <div
                        style={{
                          color: "#888",
                          fontWeight: "17px",
                          textAlign: "end",
                        }}
                      >
                        kWh
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex" }}>
                    <img
                      src={DollarOn}
                      style={{ width: "45px", height: "45px" }}
                    />
                    <div style={{ marginTop: "4px", marginLeft: "5px" }}>
                      <div
                        style={{
                          fontSize: "25px",
                          color: "#444",
                          fontWeight: "bold",
                        }}
                      >
                        {globalEnergy?.cost.toLocaleString()}
                      </div>
                      <div
                        style={{
                          color: "#888",
                          fontWeight: "17px",
                          textAlign: "end",
                        }}
                      >
                        $
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Divider />
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  marginTop: "25px",
                }}
              >
                <div style={{ width: "140px", textAlign: "center" }}>
                  <img src={Tons} />
                  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {calculate("co2").toLocaleString() + " kgs"}
                  </div>
                  <div style={{ color: "grey", fontSize: "16px" }}>
                    emissions
                  </div>
                </div>
                <div style={{ width: "140px", textAlign: "center" }}>
                  <img src={Trees} style={{ width: "96px", height: "96px" }} />
                  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {Math.floor(calculate("co2") * 0.00111).toLocaleString()}{" "}
                    Trees
                  </div>
                  <div style={{ color: "grey", fontSize: "16px" }}>
                    to offset CO2
                  </div>
                </div>

                <div style={{ width: "140px", textAlign: "center" }}>
                  <img src={Home} />
                  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {calculate("homes").toLocaleString()} Homes
                  </div>
                  <div style={{ color: "grey", fontSize: "16px" }}>
                    Powered for one day
                  </div>
                </div>

                <div style={{ width: "140px", textAlign: "center" }}>
                  <img src={School} />
                  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {Math.floor(calculate("homes") * 0.1).toLocaleString()}{" "}
                    School
                  </div>
                  <div style={{ color: "grey", fontSize: "16px" }}>
                    Powered for one day
                  </div>
                </div>
                <div style={{ width: "140px", textAlign: "center" }}>
                  <img
                    src={ElectricCar}
                    style={{ width: "96px", height: "96px" }}
                  />
                  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {calculate("cars").toLocaleString()} E-Cars
                  </div>
                  <div style={{ color: "grey", fontSize: "16px" }}>
                    Fully Charged
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    display: "flex",
                    cursor:'pointer'
                  }}
                  onClick={() => setOpenPopup(true)}
                >
                  <InfoIcon
                    sx={{ color: "lightgrey", cursor: "pointer" }}
                    
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "lightgrey",
                      marginLeft: "8px",
                    }}
                  >
                    References
                  </span>
                </div>
                <Tooltip 
                // title={`${copied ? 'Copied' : 'Copy URL'}`}
                placement="top"
                >
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    display: "flex",
                    cursor:'pointer'
                  }}
                  onClick={() => {
                    // setCopied(true)
                    // navigator.clipboard.writeText("https://www.epa.gov/")
                    window.open('https://www.epa.gov/')
                  }}
                >
                  {
                    copied ?
                    <CheckIcon sx={{ color: "lightgrey", cursor: "pointer" }} />
                    :
                  <LinkIcon
                    sx={{ color: "lightgrey", cursor: "pointer" }}
                    
                  />
                  }
                  <span
                    style={{
                      fontSize: 10,
                      color: "lightgrey",
                      marginLeft: "8px",
                    }}
                  >
                    US Environment Protection Agency URL
                  </span>
                </div>
                </Tooltip>
              </div>
            </Fragment>
          )}
        </Box>
      </Modal>
      {/* <Dialog
        open={openPopup}
        onClose={() => {
          setOpenPopup(false);
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">References</DialogTitle>
        <DialogContent>
          <div style={{ fontSize: "16px", color: "grey", margin: '0px 20px 20px 20px' }}>
            {getReferences()}
          </div>
        </DialogContent>
      </Dialog> */}
    </Fragment>
  );
}
