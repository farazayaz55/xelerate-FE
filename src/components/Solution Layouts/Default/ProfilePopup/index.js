//-----------CORE------------//
import React, { useEffect, useState } from "react";
//--------------MUI--------------//
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { useSnackbar } from "notistack";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
import { useGetProfilesQuery } from "services/services";
import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useApplyProfileMutation } from "services/services";
import FormControl from "@mui/material/FormControl";
// import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import DeleteAlert from "components/Alerts/Delete";
import { Typography } from "antd";
import { useGetSpecificRoleQuery } from "services/roles";
import { setRole } from "rtkSlices/metaDataSlice";
import { setLoader } from "rtkSlices/metaDataSlice";

//----------EXTERNAL COMPS----------//

export default function ProfilePopup(props) {
  const token = window.localStorage.getItem("token");
  const [selectedProfile, setSelectedProfile] = useState(props.profile ? props.profile._id : props.profiles?.length ?props.profiles[0]._id: "");
  const [applied, setApplied] = useState(false);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [solutionApplied, setSolutionApplied] = React.useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !solutionApplied,
  });
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (selectedProfile.length){
      const profileData = props.profiles.find((elm) => elm._id == selectedProfile)
      setSelectedProfileData(profileData)
    }}, [selectedProfile])


  const [applyProfile, applying] = useApplyProfileMutation();

  const selectProfile = (e) => {
    setSelectedProfile(e.target.value);
  };

  const handleApplyProfile = async () => {
    const body = {
      serviceId: props.id,
      profileId: selectedProfile,
    };
    let submitted = await applyProfile({ token, body });
    if (submitted.data?.success) {
      showSnackbar("Profiles", submitted.data.message, "success");
      setSolutionApplied(true)
      props.setProfilePopup(true);
      window.location.reload(false)
    } else {
      setSolutionApplied(false)
      showSnackbar("Profiles", submitted.data?.message || "failed", "error");
    }
  };

  useEffect(() => {
    if (roleRes.isSuccess && !roleRes.isFetching) {
      window.localStorage.setItem("Language", "en");
      dispatch(setRole(roleRes.data.payload));
      dispatch(setLoader(false));
      setSolutionApplied(false)
    }
  }, [roleRes.isFetching]);

  return (
    <div>
      <Dialog
        open={true}
        onClose={props.handlePopupClose}
        aria-labelledby="form-dialog-title"
        // maxWidth="md"
        PaperProps={{ style: { width: "500px", height: "420px" } }}
      >
        <DialogTitle id="form-dialog-title">Apply Profile</DialogTitle>
        <DialogContent>
          {props.profiles?.length ? (
            <FormControl fullWidth margin="dense">
              <InputLabel>Templates</InputLabel>
              <Select
                value={selectedProfile}
                name="profile"
                fullWidth
                onChange={selectProfile}
                label="Profile"
              >
                {props.profiles.map((profile) => {
                  return (
                    <MenuItem value={profile._id}>{profile.name}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : props.profilesRes.isFetching ? (
            <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            >
              
              <CircularProgress />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "22px",
                marginTop: "25px",
                color: "grey",
                opacity: 0.4,
              }}
            >
              No Templates in this Solution
            </div>
          )}
          {selectedProfileData &&
          <div>
            <Typography style={{marginTop: "9px", fontSize: "15px"}}>Description:</Typography>
            <div style={{ 
              border: "1px solid rgba(0,0,0,0.05)", 
              borderRadius: "10px",
              padding: "5px",
              minHeight: "10vh",
              height: "100%",
              marginTop: "12px", 
            }}>
              <p style={{
                padding: "5px"
              }}>{selectedProfileData.remarks}</p>
            </div>
            <div style={{
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              marginTop: "12px",
            }}>
              <div style={{ 
                marginTop: "10px", 
                height: "10vh",
                width: "80%", 
                backgroundColor: "aliceblue", 
                padding: "5px", 
                marginRight: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "10px",
              }}>
                <Typography style={{color: "gray", fontWeight: "bold"}}>{`${selectedProfileData.rules.length} Rule${selectedProfileData.rules.length !== 1 ? "s" : ""}`}</Typography>
              </div>
               <div style={{
                  width: "80%", 
                  marginTop: "10px", 
                  height: "10vh", 
                  backgroundColor: "lightyellow", 
                  padding: "5px", 
                  marginLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "10px",
                }}>
                <Typography style={{color: "gray", fontWeight: "bold"}}>{`${selectedProfileData.spectrum.length} Color Spectrum${selectedProfileData.spectrum.length !== 1 ? "s" : ""}`}</Typography>
              </div>
            </div>
          </div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setProfilePopup()} color="error">
            Cancel
          </Button>
          <Button type="submit" onClick={()=>setApplied(true)} color="success" disabled={!selectedProfile}>
            {/* {result.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <span>Submit</span>
            )} */}
            <span>Submit</span>
          </Button>
        </DialogActions>
      </Dialog>
      {applied ? (
        <DeleteAlert
          deleteModal={applied}
          question="This will remove all existing rules and color spectrums and apply ones defined in this profile? (this is a non reversible action)"
          platformCheck={false}
          id={""}
          handleDelete={handleApplyProfile}
          handleClose={()=>setApplied(false)}
          deleteResult={applying}
        />
      ) : null}
    </div>
  );
}
