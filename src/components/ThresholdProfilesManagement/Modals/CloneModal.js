import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Divider } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useAddProfileMutation } from "services/services";
import DeleteAlert from "components/Alerts/Delete";

export default function CloneModal({
  open,
  question,
  handleClose,
  title,
  services,
  solution,
  profile,
  showSnackbar,
  setServiceForClone,
  handleClone,
  serviceFrom
}) {

  const [serviceId, setServiceId] = React.useState("")
  const [conflictingDatapointNames, setConflictingDatapointNames] = React.useState([])
  const [conflictingDatapoint, setConflictingDatapoint] = React.useState([])

  const checkDataPoints = (service, profile) => {
    let falseMatch = false
    let conflictingDatapoints = [];
    if(!profile.spectrum.length){
      return conflictingDatapoints
    }
    profile.spectrum.forEach((spectrum) => {
      if(spectrum.dataPoint?.id){
        let found = service.sensors.find((elm) => elm._id == spectrum?.datapoint?._id)
        if(!found){
          falseMatch=true
          conflictingDatapoints.push(spectrum)
        }
      } else {
        let found = service.sensors.find((elm) => elm._id == spectrum?.dataPoint)
        if(!found){
          falseMatch=true
          conflictingDatapoints.push(spectrum)
        }
      }
    })
    console.log({conflictingDatapoints})
    return conflictingDatapoints

    // for(let i=0; i<=profile?.spectrum.length; i++){
    //   const found = service.sensors.find((elm) => elm._id == profile?.spectrum[i]?.datapoint?._id)
    //   if(!found){
    //     falseMatch = true
    //   }
    //   return falseMatch
    // }
    // service.dataPointThresholds.forEach((elm) => {
    //   profile.spectrum.forEach((spectrumData) => {
    //     if(spectrumData.datapoint?._id !== elm.datapoint?._id){
    //       falseMatch = true
    //     }
    //   })
    // })
  }

  const handleProfileClone = async (id) => {
    const service = services.find((service) => service.id == id)
    const conflictingDatapoints = checkDataPoints(service, profile)
    setConflictingDatapoint(conflictingDatapoints)
    // if(conflictingDatapoints.length){
    //   handleClose()
    //   showSnackbar("Profiles", "Profile Datapoints do not match with selected service", "error", 1000)
    // } else {
      // showSnackbar("Template", "Template Cloned Successfully", "success", 1000)
      setServiceForClone(id)
      const tempNames = serviceFrom.sensors.filter(s=> conflictingDatapoints.find(c=>(c.datapoint?._id || c.dataPoint) == s._id)).map(s=>s.name);
      setConflictingDatapointNames(tempNames)
      if(tempNames.length){
        setServiceId(id)
      }
      else{
        handleClose()
        handleClone(id, conflictingDatapoints)
      }
      // showSnackbar("Profiles", `Following profile datapoints "${conflictingDatapointsNames.join()}" conflict with the seleted service, therefore would be removed `, "info", 3000)
    // }
  }

  return (
    <Dialog open={open} onClose={handleClose}
    PaperProps={{ style: { maxWidth: "480px" } }}
    >
      <DialogTitle id="alert-dialog-title" style={{paddingBottom:'10px'}}>
        {title ? title : "Confirmation"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <div>
            {question}
            <div style={{maxHeight: "70vh", overflowY: "scroll"}}>
              <Divider style={{color: "rgba(0,0,0,0.1)", marginBottom: "10px"}}/>
              {services.map((service) =>
                    <div
                    style={{
                        width: "25vw",
                        cursor: "pointer"
                      }} 
                      key={service.id}
                      onClick={()=>handleProfileClone(service.id)}
                      >
                        <span style={{color: "darkgray"}}>{service.name}</span>
                        <Divider style={{color: "rgba(0,0,0,0.1)", marginTop: "10px", marginBottom:"10px"}}/>
                    </div>
                  )
                }
            </div>
          </div>
                <div style={{color:'rgb(203 203 203)', fontSize:'11px', width:'100%', margin:'10px 0px'}}>Note: in case of multiple types of assets in target solution, These rules and spectrums will be applied to all asset types</div>
        </DialogContentText>
        {serviceId ? (
        <DeleteAlert
          deleteModal={true}
          question={`Following datapoints [ ${conflictingDatapointNames.join(', ')} ] do not exist in target solution. Are you sure you want to proceed? ( missing datapoints will be skipped )`}
          platformCheck={false}
          id={null}
          handleDelete={()=>{
            handleClose()
            handleClone(serviceId, conflictingDatapoint)
          }}
          handleClose={()=>setServiceId("")}
          deleteResult={{}}
          title={`Clone profile to ${services.find((service) => service.id == serviceId).name}`}
        />
      ) : null}
      </DialogContent>
    </Dialog>
  );
}
