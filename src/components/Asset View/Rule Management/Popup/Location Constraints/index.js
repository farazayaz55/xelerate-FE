import React, {useEffect, useState} from 'react'
import {Switch, Typography, Checkbox } from '@mui/material'
import {useSelector} from 'react-redux'
import LocationOffIcon from '@mui/icons-material/LocationOff';

const index = ({geofences, form}) => {
  const metaDataValue = useSelector((state) => state.metaData);
  const [noRestriction, setNoRestriction] = useState(true)

  useEffect(() => {
    if(form.values.locationConditions.length){
      setNoRestriction(false)
    }
  },[form])

  const checkIfValueSelected = (UUID) => {
    const found = form.values.locationConditions.find((condition) => condition.globalUUID === UUID)
    if(found){
      return true
    } else {
      return false
    }
  }

  return (
    <div>
      <div style={{display: "flex", width: "100%", justifyContent: "center", alignItems: "center", marginTop: "15px", marginBottom: "15px"}}>
        <div style={{display: "flex", width: "max-content", justifyContent: "center", alignItems: "center", border: "1px solid lightgray", borderRadius: "10px"}}>
           <div
            style={{
              color: "grey",
              width: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "13px",
              cursor: "pointer",
              borderRight: "1px solid lightgrey",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              padding: "5px",
              backgroundColor:
                noRestriction &&
                metaDataValue.branding.primaryColor,
              color:
                noRestriction &&
                "white",
            }}
            onClick={(e) => {
              setNoRestriction(true)
              form.setFieldValue(`locationConditions`, []);
            }}
          >
            No Restrictions
          </div>
          <div
            style={{
              color: "grey",
              width: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "13px",
              cursor: "pointer",
              borderRight: "1px solid lightgrey",
              padding: "5px",
              backgroundColor:
                !noRestriction && form.values.locationsConditionsOperator == "Include" &&
                metaDataValue.branding.primaryColor,
              color:
                !noRestriction && form.values.locationsConditionsOperator == "Include" &&
                "white",
            }}
            onClick={(e) => {
              setNoRestriction(false)
              form.setFieldValue(`locationsConditionsOperator`, "Include");
            }}
          >
            {"Inside Geofence(s)"}
          </div>
          <div
            style={{
              color: "grey",
              width: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "13px",
              cursor: "pointer",
              borderLeft: "1px solid lightgrey",
              padding: "5px",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              backgroundColor:
                !noRestriction && form.values.locationsConditionsOperator == "Exclude" &&
                metaDataValue.branding.primaryColor,
              color:
                !noRestriction && form.values.locationsConditionsOperator == "Exclude" &&
                "white",
            }}
            onClick={(e) => {
              setNoRestriction(false)
              form.setFieldValue(`locationsConditionsOperator`, "Exclude");
            }}
          >
            {"Outside Geofence(s)"}
          </div>
        </div>
      </div>
      {/* <div style={{display: "flex", gap: "10px", alignItems: "center", marginTop: "10px", marginBottom: "10px"}}>
          <Switch value={form.values.locationsConditionsOperator == "Exclude"} onChange={(e) => {
            if(e.target.checked){
              form.setFieldValue("locationsConditionsOperator", "Exclude")
            } else {
              form.setFieldValue("locationsConditionsOperator", "Include")
            }
          }}/>
          <Typography style={{fontWeight: "bold", display: "flex", fontSize: "16px"}}>
            {"( "}
            <Typography 
              style={{
                color: form.values.locationsConditionsOperator == "Include" ? "green" : "black",
                fontWeight: form.values.locationsConditionsOperator == "Include" ? "bolder" : "bold"
              }}
            >
              Include
            </Typography>
            {" / "}
            <Typography 
              style={{
                color: form.values.locationsConditionsOperator == "Exclude" ? "green" : "black",
                fontWeight: form.values.locationsConditionsOperator == "Exclude" ? "bolder" : "bold"
            }}
            >
              Exclude
            </Typography>
            {" )"}
          </Typography>
          <Typography style={{fontSize: "16px"}}>of following Geofences: </Typography>
      </div> */}

      {noRestriction ? (
      <div style={{height: "40vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <LocationOffIcon style={{fontSize: "100px", color: "rgba(0,0,0,0.3)", margin: "10px auto"}}/>
          <Typography style={{fontSize: "16px", color: "rgba(0,0,0,0.3)"}}>No Location Restriction Will be Applied</Typography>
        </div>
      </div>) : (
        <div style={{padding: "5px", height: "40vh", overflowY: "scroll"}}>
          <div
            style={{display: "flex", alignItems: "center", gap: "10px"}}
          >
            <Checkbox
              checked={form.values.locationConditions.length == geofences.length}
              disabled={noRestriction}
                onChange={() => {
                  if(form.values.locationConditions.length == geofences.length){
                    form.setFieldValue("locationConditions", [])
                  } else {
                    form.setFieldValue("locationConditions", geofences.map((geofence) => ({globalUUID: geofence.globalUUID, ...geofence.region})))
                  }
                }}
            />
            <Typography style={{color: noRestriction ? "rgba(0, 0, 0, 0.3)" : "rgba(0,0,0,0.6)" }}>Select All</Typography>
          </div>
          {geofences.map((geofence) => (
              <div key={geofence.globalUUID} style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <Checkbox
                  checked={checkIfValueSelected(geofence.globalUUID)} 
                  onChange={() => form.setFieldValue("locationConditions", form.values.locationConditions.find((condition) => condition.globalUUID === geofence.globalUUID) ? form.values.locationConditions.filter((condition) => condition.globalUUID !== geofence.globalUUID) : [...form.values.locationConditions, {globalUUID: geofence.globalUUID, ...geofence.region}])}
                  disabled={noRestriction}
                />
                <Typography style={{color: noRestriction ? "rgba(0, 0, 0, 0.3)" : "black" }}>{geofence.name}</Typography>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

export default index