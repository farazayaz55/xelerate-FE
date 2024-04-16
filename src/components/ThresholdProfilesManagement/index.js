//----------------CORE-----------------//
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetProfilesQuery,
  useAddProfileMutation, 
  useEditProfileMutation, 
  useDeleteProfileMutation,
  useApplyProfileMutation
} from "services/services"
import { useSnackbar } from "notistack";
import { useDispatch } from 'react-redux';
import { setProfileList, addProfile, editProfile, removeProfile } from 'rtkSlices/profilesSlice';
//----------------MUI-----------------//
import { Card, FormControl, Button, TextField, Typography, Divider, Tooltip, IconButton, Zoom, InputLabel, MenuItem, Select} from '@mui/material'
//----------------MUI ICONS-----------------//
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
//----------------EXTERNAL-----------------//
import Rules from "./Rules";
import ColorSpectrumPopup from "./ColorSpectrumPopup";
import ProfileSelection from './ProfileSelection';
import Edit from "components/Asset View/Rule Management/Popup";
import DeleteModal from "./Modals/DeleteModal"
import CloneModal from './Modals/CloneModal';
import ApplyModal from './Modals/ApplyModal';
import {
  setRole,
  setLoader,
} from "rtkSlices/metaDataSlice";
import { useGetSpecificRoleQuery } from 'services/roles';
const ThresholdProfiles = (props) => {
  const metaDataValue = useSelector((state) => state.metaData);
  const {profileList} = useSelector((state) => state.profiles)
  const [addProfile, addProfileSuccess] = useAddProfileMutation();
  const [editProfile, editProfileSuccess ] = useEditProfileMutation();
  const [deleteProfile, deleteProfileSuccess ] = useDeleteProfileMutation();
  const [applyProfile, applyProfileSuccess ] = useApplyProfileMutation();
  const [solution, setSolution] = React.useState("");
  const [profile, setProfile] = React.useState(null);
  const [service, setService] = React.useState(null);
  const [newProfile, setNewProfile] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [openEditPopup, setOpenEditPopup] = React.useState(false);
  const [dataPoint, setDataPoint] = React.useState(null);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [openCloneModal, setOpenCloneModal] = React.useState(false);
  const [openApplyModal, setOpenApplyModal] = React.useState(false);
  const [serviceForClone, setServiceForClone] = React.useState("");
  const [blocked, setBlocked] = React.useState(false);
  const [allProfiles, setAllProfiles] = React.useState([]);
  const [solutionApplied, setSolutionApplied] = React.useState(false);
  const profiles = useGetProfilesQuery({
    token: localStorage.getItem("token"),
    param: ""
  },
  { refetchOnMountOrArgChange: true }
  )

  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !solutionApplied,
  });

  const {enqueueSnackbar} = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "Thresholds Profile Management";
  }, []);

  useEffect(() => {
    if(!profiles.isFetching && profiles.isSuccess){
      setSolution(metaDataValue?.services[0]?.id);
      setAllProfiles(profiles?.data?.payload)
      const filteredProfileList = allProfiles.filter((elm) => elm.serviceId == metaDataValue?.services[0]?.id)
      dispatch(setProfileList(filteredProfileList))
      setService(metaDataValue?.services[0]);
    }
  }, [profiles.isFetching]);

  useEffect(() => {
    setService(metaDataValue?.services.find((s) => s.id == solution));
    const filteredProfileList = allProfiles.filter((elm) => elm.serviceId == solution)
    dispatch(setProfileList(filteredProfileList))
  }, [solution])


  useEffect(() => {
    if(addProfileSuccess.isSuccess) {
      if(newProfile){
        setProfile(addProfileSuccess?.data?.payload)
        const newProfileList = profileList.map((elm) => elm._id == "null" ? addProfileSuccess?.data?.payload : elm)
        dispatch(setProfileList(newProfileList))
      }
      setNewProfile(false)
      if(serviceForClone == solution) {
        dispatch(setProfileList([...profileList, addProfileSuccess?.data?.payload]))
      }
      setAllProfiles([...allProfiles, addProfileSuccess?.data?.payload])
      showSnackbar("Profiles", serviceForClone ? "Profile Cloned Successfully" : "Profile Created Successfully", "success", "1000")
      setServiceForClone("")
    }
    else if(addProfileSuccess.error){
      showSnackbar("Profiles", addProfileSuccess.error?.data?.message, "error", "1000")
    }
  }, [addProfileSuccess.isLoading])

  useEffect(() => {
    if(deleteProfileSuccess.isSuccess) {
      dispatch(removeProfile(profile._id))
      setAllProfiles(allProfiles.filter(elm => elm._id !== profile._id))
      setProfile(null);
      showSnackbar("Profiles", "Profile Deleted Successfully", "success", "1000")
      setServiceForClone("")
    }
  }, [deleteProfileSuccess])

  useEffect(() => {
    if(editProfileSuccess.isSuccess) {
      setProfile(editProfileSuccess?.data?.payload);
      dispatch(setProfileList(profileList.map((elm) => elm._id == editProfileSuccess?.data?.payload._id ? editProfileSuccess?.data?.payload : elm)))
      setAllProfiles(allProfiles.map((elm) => elm._id == editProfileSuccess?.data?.payload._id ? editProfileSuccess?.data?.payload : elm))
      showSnackbar("Profiles", "Profile Updated Successfully", "success", "1000")
      setServiceForClone("")
    }
  }, [editProfileSuccess])

  useEffect(() => {
    if(applyProfileSuccess.isSuccess) {
      showSnackbar("Profiles", "Profile Applied Successfully", "success", "1000")
      setSolutionApplied(true)
      setServiceForClone("")
    }
  }, [applyProfileSuccess])

  useEffect(() => {
    if (roleRes.isSuccess && !roleRes.isFetching) {
      window.localStorage.setItem("Language", "en");
      dispatch(setRole(roleRes.data.payload));
      dispatch(setLoader(false));
      setSolutionApplied(false)
    }
  }, [roleRes.isFetching]);

  function getPermission(chk) {
    let value;
    service?.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const handleChangeName = (value) => {
    setProfile({
      ...profile,
      name: value,
    })
  }

  const handleChangeRemarks = (value) => {
    setProfile({
      ...profile,
      remarks: value,
    })
  }

  const handleProfileDelete = () => {
    deleteProfile({
      token: localStorage.getItem("token"),
      id: profile?._id,
    })
  }

  const handleProfileApply = () => {
    setOpenApplyModal(false)
    applyProfile({
      token: localStorage.getItem("token"),
      body: {
        serviceId: solution,
        profileId: profile?._id,
      }
    })
  }

  const handleProfileClone = (serviceId, dps) => {
    const tempProfile = JSON.parse(JSON.stringify(profile))
    const filteredSpectrum = tempProfile.spectrum.filter(s=> !dps.find(d=>d._id == s._id));
    const targetService = metaDataValue.services.find(s=>s.id == serviceId);
    const allSensors = targetService.sensors;
    const filteredRules = tempProfile.rules.filter(rule=> rule.multipleOperations.find(mo=> (allSensors.find(a=>a.name == mo.parameter))));
    tempProfile.spectrum = filteredSpectrum;
    tempProfile.rules = filteredRules;
    if(tempProfile.platformDeviceTypeAllowed || targetService.assets.length > 1){
      tempProfile.platformDeviceTypeAllowed = targetService.assets.map(a=>a.id)
    }
    setProfile(tempProfile)
    addProfile({
      token: localStorage.getItem("token"),
      body: {
        ...tempProfile,
        serviceId,
        name: `Clone - ${profile.name}`
      }
    })
  }

  const handleOpenColorPopup = (e) => {
    setOpenPopup(true);
  }

  const handleRuleSubmit = (body) => {
    let newProfile = {
      ...profile,
      rules: [...profile?.rules, body],
    }
    setProfile(newProfile)
    setOpenEditPopup(false)
  }

  const handleRuleUpdate = (body, id) => {
    let newProfile = {
      ...profile,
      rules: profile?.rules.map((elm, i) => i == id ? body : elm)
    }
    setProfile(newProfile)
  }

  const handleRuleDelete = (id) => {
    let newProfile = {
      ...profile,
      rules: profile?.rules.filter((elm, i) => i != id)
    }
    setProfile(newProfile)
  }

  const handleSpectrumSubmit = (values, reverse, customRange) => {
    const dataPointObj = service?.sensors.find((elm) => elm._id == dataPoint);
    let spectrum = {
      dataPoint: dataPointObj,
      colorArray: customRange ? values.customColors.map((e) => e.value) : values.colors.map((e) => e.value),
      ranges: customRange ? values.customColors.map((e) => {
        return {
          label: e.label,
          min: e.min,
          max: e.max,
        }
      }
      ) : [],
      min: customRange ? null : values.min,
      max: customRange ? null : values.max,
      reverse: reverse,
    }
    const found = profile?.spectrum.find((elm) => {
      if(elm.dataPoint?._id){
        return elm.dataPoint?._id == dataPoint
      } else {
        return elm.dataPoint == dataPoint
      }
    })
    if(found) {
      let newSpectrum = profile?.spectrum.map((elm) => {
        if(elm.dataPoint?._id){
          if(elm.dataPoint?._id == dataPoint){
            return spectrum
          } else {
            return elm
          }
        } else {
          if(elm.dataPoint == dataPoint){
            return spectrum
          } else {
            return elm
          }
        }
      })
      let newProfile = {
        ...profile,
        spectrum: newSpectrum
      }
      setProfile(newProfile)
      console.log({newProfile}, {sensors: service.sensors})
    } else {
      let newProfile = {
        ...profile,
        spectrum: [...profile?.spectrum, spectrum]
      }
      setProfile(newProfile)
      console.log({newProfile}, {sensors: service.sensors})
    }
    setOpenPopup(false)
  }

  const generatePersistData = (service) => {
    const found = profile.spectrum.find((elm) => {
      if(elm.dataPoint?._id){
        return elm.dataPoint?._id == dataPoint
      }else{
        return elm.dataPoint == dataPoint
      }
    })
    if(found) {
      let persist = {
        dataPointThresholds: {
          colors: found.colorArray.map((elm, i) => {
            return {
              value: elm,
              label: found.ranges?.lenght > 0 ? found.ranges[i].label : `Color ${i + 1}`,
            }
          }
          ),
          customColors: found.ranges?.length > 0 ? found.ranges.map((elm, i) => {
            return {
              value: found.colorArray[i],
              label: elm.label,
              min: elm.min,
              max: elm.max,
            }
          }
          ) :  [
            {
              label: "Color 1",
              value: "#ff1001",
              min: "0",
              max: "33",
            },
            {
              label: "Color 2",
              value: "#febe00",
              min: "34",
              max: "66",
            },
            {
              label: "Color 3",
              value: "#03bd00",
              min: "67",
              max: "100",
            },
          ],
          min: found?.min ? found.min : 0,
          max: found?.max ? found.max : 100,
          reverse: found?.reverse ? found.reverse : false,
          customRange: found?.ranges?.length > 0 ? true : false,
        },
      }
      return {
        ...service,
        persist,
      }
    } else {
      let persist = {
        dataPointThresholds: {
          colors: ["#ff0000", "#ffff00", "#00ff00"].map((elm, i) => {
            return {
              value: elm,
              label: `Color ${i + 1}`,
            }
          }),
          customColors:  [
            {
              label: "Color 1",
              value: "#ff1001",
              min: "0",
              max: "33",
            },
            {
              label: "Color 2",
              value: "#febe00",
              min: "34",
              max: "66",
            },
            {
              label: "Color 3",
              value: "#03bd00",
              min: "67",
              max: "100",
            },
          ],
          min: 0,
          max: 100,
          reverse: false,
          customRange: false,
        },
      }
      return {
        ...service,
        persist,
      }
    }
  }

  const initialState = {
    _id: "null",
    name: "",
    remarks: "",
    serviceId: solution,
    rules: [],
    spectrum: []
  }

  const addNew = () => {
    const found = profileList.find((elm) => elm._id == "null")
    if(found) return
    dispatch(setProfileList([...profileList, initialState]))
    setProfile(initialState)
    setNewProfile(true);
  }

  const handleProfileSave = () => {
    const body = JSON.parse(JSON.stringify(profile))
    if(body?.name == "") {
      showSnackbar("Profiles", "Profile Name is required", "error", "1000")
      return;
    }
    if(body?.remarks == "") {
      showSnackbar("Profiles", "Profile Description is required", "error", "1000")
      return;
    }
    if(!body?.rules.length && !body?.spectrum.length) {
      showSnackbar("Profiles", "Profile Rules or Color spectrums are not defined", "error", "1000")
      return;
    }
    body.rules.forEach(rule=>{
      rule.userId = localStorage.getItem('user');
    })

    let filteredSpectrums = []
    body.spectrum.forEach((spectrum) => {
      let found
      if(spectrum?.dataPoint?._id){
        found = service.sensors.find((s) => s._id == spectrum?.dataPoint?._id)
      } else {
        found = service.sensors.find((s) => s._id == spectrum?.dataPoint)
      }
      if(found){
        filteredSpectrums.push(spectrum)
      }
    })

    if(newProfile){
      addProfile({
        token: localStorage.getItem("token"),
        body: {
          ...body,
          spectrum: filteredSpectrums
        },
      })
    } else {
      editProfile({
        token: localStorage.getItem("token"),
        id: body?._id,
        body: {
          ...body,
          spectrum: filteredSpectrums
        },
      })
    }
  }

  const setCloneService = (val) => {
    setServiceForClone(val);
  }

  function isPermitted(){
    return service && service.tabs.find(t=>t.name == "Threshold Profiles") && service.tabs.find(t=>t.name == "Threshold Profiles").permission == "ALL" ? true : false
  }

  return (
    <>
      {openEditPopup ? (
        <Edit
          fields={service?.sensors}
          openPopup={openEditPopup}
          id={service?.id}
          setOpenPopup={setOpenEditPopup}
          updateRuleFn={() => {handleRuleSubmit()}}
          group={""}
          permission={getPermission("Controlling")}
          handleSubmit={handleRuleSubmit}
        />
      ) : null}
      {openPopup && <ColorSpectrumPopup 
        state={openPopup}
        close={() => setOpenPopup(false)}
        handleSubmit={handleSpectrumSubmit}
        name={service?.sensors.find((elm) => elm._id == dataPoint)?.friendlyName}
        service={generatePersistData(service)}
      />}
      {openDeleteModal && <DeleteModal
          deleteModal={openDeleteModal}
          title={"Delete Profile"}
          question={"Confirm to delete this Profile?"}
          handleDelete={handleProfileDelete}
          handleClose={() => setOpenDeleteModal(false)}
          deleteRes={deleteProfileSuccess} 
        />
      }
      {openCloneModal && <CloneModal
        open={openCloneModal}
        title={`Clone Profile`}
        question={"Choose Solution to clone Profile into"}
        handleClose={()=> setOpenCloneModal(false)}
        services={metaDataValue?.services}
        solution={solution}
        profile={profile}
        showSnackbar={showSnackbar}
        setServiceForClone={setCloneService}
        handleClone={handleProfileClone}
        serviceFrom={service}
      />
      }
      {openApplyModal && <ApplyModal
          applyModal={openApplyModal}
          title={"Apply Profile to Solution"}
          question={`This will remove all existing rules and color spectrums and apply ones defined in this profile?`}
          warning={"(this is a non reversible action)"}
          handleApply={handleProfileApply}
          handleClose={() => setOpenApplyModal(false)}
          applyRes={applyProfileSuccess} 
        />
      }
      <Card 
        style={{
          display:"flex", 
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%", 
          padding: "20px", 
          height: "85vh"
        }}>
          <div style={{marginTop: "20px"}}>
            <div style={{display: "flex", alignItems: "center", margin: "5px"}}>
              <FormControl sx={{width:'300px'}}>
                <InputLabel id="solution-select-label">Solution</InputLabel>
                <Select 
                  labelId = "solution-select-label" 
                  id="solution-select"
                  value={solution}
                  onChange={(e) => {
                    if(blocked) return;
                    setServiceForClone("")
                    setSolution(e.target.value)
                    dispatch(setProfileList([]))
                    setProfile(null)
                    setNewProfile(false)
                  }}
                  label="Select Solution"
                  disabled={blocked}
                  >
                  {
                    metaDataValue?.services?.map((elm, i) => {
                      return <MenuItem key={i} value={elm.id}>{elm.name}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
              <ProfileSelection
                metaDataValue={metaDataValue}
                solution={solution}
                setSolution={setSolution}
                profile={profile}
                setProfile={setProfile}
                service={service}
                newProfile={newProfile}
                setNewProfile={setNewProfile}
                setServiceForClone={setServiceForClone}
                profileList={profileList}
                setBlocked={setBlocked}
                profiles={profiles}
              />
            </div>
            <Divider style={{marginTop: "25px"}}/>
            {profile ? 
              <div style={{display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent:"space-between", padding:"5px", marginTop:"5vh"}}>
                <div style={{display: "flex", flexDirection:"column", width: "400px",}}>
                  <Typography style={{padding: "10px", height: "5vh", margin: "auto 0"}}>Profile Details</Typography>
                  <FormControl sx={{marginTop: "7px"}}>
                    <TextField
                      fullWidth
                      id="profile-name"
                      placeholder="Profile Name"
                      required
                      value={profile? profile?.name : ""}
                      onChange={(e) => {handleChangeName(e.target.value)}}
                    />
                  </FormControl>
                  <FormControl sx={{marginTop: "20px"}}>
                    <TextField
                      fullWidth
                      id="description"
                      placeholder="Description"
                      required
                      value={profile? profile?.remarks : ""}
                      onChange={(e) => {handleChangeRemarks(e.target.value)}}
                      multiline
                      inputProps={{ style: {height: "31.1vh"} }}
                    />
                  </FormControl>
                </div>
                <div style={{display:"flex", width:"100%", justifyContent: "space-between", alignItems: "flex-start", marginLeft: "20px", borderRadius:"10px", height:"46vh"}}>  
                    <div style={{minwidth:"550px", width: "100%", marginRight: "10px", height: "100%"}}>
                      <div style={{display: "flex", justifyContent: "space-between", height:"5vh"}}>
                        <Typography style={{padding: "10px"}}>Rules</Typography>
                        <span
                          style={{
                            
                          }}
                        >
                          <Tooltip
                            title="Add Rule"
                            placement="bottom"
                            arrow
                            TransitionComponent={Zoom}
                          >
                            <IconButton color="secondary" onClick={() => setOpenEditPopup(true)}>
                              <AddCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </span>
                      </div>
                      <div style={{ height:"100%", maxWidth:"100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", paddingLeft: "8px", marginTop: "5.5px"}}> 
                        <Rules
                          id={service?.id}
                          fields={service?.sensors}
                          rules={getPermission("Rule Management")}
                          controls={getPermission("Controlling")}
                          rulesData={profile?.rules}
                          permission={getPermission("Controlling")}
                          handleUpdate={handleRuleUpdate}
                          handleDelete={handleRuleDelete}
                        />
                      </div>
                    </div>
                  <div style={{minWidth: "350px", width: "100%", marginLeft: "10px", height:"46vh"}}>
                    <div style={{display: "flex", justifyContent: "space-between", height: "5vh"}}>
                      <Typography style={{padding: "10px"}}>Color Spectrum</Typography>
                    </div>
                    <div style={{width:"100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius:"10px", height:"100%",  overflowY:"scroll", marginTop: "5.5px"}}>
                      {service?.sensors.length > 0 && service?.sensors.map((elm, i, arr) => (
                        <>
                        <div 
                          style={{
                            display: "flex", 
                            justifyContent: "space-between", 
                            padding: "10px", 
                            alignItems:"center",  
                            borderRadius: "10px",
                          }} 
                          key={i}
                        >
                          <Typography>{elm.friendlyName}</Typography>
                          {profile?.spectrum.find((spectrumData) => {
                            if(spectrumData.dataPoint?._id){
                              return spectrumData.dataPoint?._id == elm._id
                            }else{
                              return spectrumData.dataPoint == elm._id
                            }
                          }) ? 
                            (<div>
                              <CheckCircleIcon
                                onClick={() => {
                                  setDataPoint(elm._id);
                                  handleOpenColorPopup()
                                }} 
                                sx={{ fontSize: "30px", marginLeft: "10px", cursor:"pointer", color: "green"}}
                              />
                              <CancelOutlinedIcon 
                                sx={{fontSize: "30px", marginLeft: "10px", cursor:"pointer", color: "red"}}
                                onClick={() => {
                                  let newSpectrum = profile?.spectrum.filter((spectrumData) => {
                                    if(spectrumData.dataPoint?._id){
                                      return spectrumData.dataPoint?._id !== elm._id
                                    }else{
                                      return spectrumData.dataPoint !== elm._id
                                    }
                                  })
                                  let newProfile = {
                                    ...profile,
                                    spectrum: newSpectrum
                                  }
                                  setProfile(newProfile)
                                }}
                              />
                            </div>) 
                            : 
                            <CheckCircleOutlineIcon 
                              onClick={() => {
                              setDataPoint(elm._id);
                              handleOpenColorPopup()
                            }} 
                            sx={{ fontSize: "30px", marginLeft: "10px", cursor:"pointer", color: "gray"}}/>
                          }
                        </div>
                        <Divider />
                        </>
                      ))}
                    </div>
                  </div>  
                </div>
              </div> 
              :
              <div style={{display: "flex", width: "100%", height: "60vh", justifyContent: "center", alignItems: "center"}}> 
              <div>
                <Tooltip title="Create New Threshold Profile">
                  <AddCircleOutlineIcon
                    style={{fontSize: "100px", color: "#3399ff", opacity: 0.5, width:'100%', cursor: "pointer"}}
                    onClick={() => addNew()} 
                  />
                </Tooltip>
                <div style={{textAlign: "center"}}>
                  <h3 style={{color:'#3399ff', opacity:0.5, fontWeight:'bold'}}>ADD NEW PROFILE</h3>
                  <h3 style={{color:'#3399ff', opacity:0.5, fontWeight:'bold'}}>OR SELECT AN EXISTING ONE TO AMEND</h3>   
                </div>
              </div>
              </div>
            }
          </div>

        <div style={{display:"flex", alignItems: "flex-end", justifyContent:'end'}}>
          {profile &&
          <> 
          {!newProfile && !serviceForClone && isPermitted() &&
          <Tooltip
            title="Apply Profile to the selected solution"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <Button
              variant="contained"
              style={{marginLeft: "3px", fontSize:"15px", borderRadius:"10px", color: "white", textTransform: "none"}}
              onClick={() => {setOpenApplyModal(true)}}
            >
              Apply to Solution
            </Button>
          </Tooltip> 
          }
          {!newProfile ?
          <Tooltip
            title="Clone this Profile"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <Button
              variant="contained"  
              style={{marginLeft: "auto", fontSize:"15px", borderRadius:"10px", color: "white", textTransform: "none"}}
              onClick={() => {setOpenCloneModal(true)}}
            >
              Clone
            </Button> 
          </Tooltip> : null} 
          <Tooltip
            title={newProfile ? "Create Profile" : "Save any changes made to this Profile"}
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <Button 
              variant="contained" 
              color="success" 
              style={{marginLeft: newProfile? "auto":"10px", fontSize:"15px", borderRadius:"10px", color: "white", textTransform: "none"}}
              onClick={() => {handleProfileSave()}}
            >
              Save
            </Button>
          </Tooltip>
          <Tooltip
            title="Discard all changes and go to reset screen"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <Button 
              variant="contained" 
              color="warning" 
              style={{marginLeft: "10px", fontSize:"15px", borderRadius:"10px", color: "white", textTransform: "none"}}
              onClick={() => {
                setServiceForClone("")
                setNewProfile(false);
                setProfile(null);
                dispatch(setProfileList(profileList.filter((elm) => elm._id != "null")))
              }}
            >
              {newProfile ? "Cancel Addition" : "Reset"}
            </Button>
          </Tooltip>
          <Tooltip
            title="Delete Selected Profile"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <Button
              variant="contained" 
              color="error" 
              style={{marginLeft: "10px", fontSize:"15px", borderRadius:"10px", color: "white", textTransform: "none", marginRight: "3px"}}
              onClick={() => { 
                setOpenDeleteModal(true)
              }}
            >
              Delete
            </Button>
          </Tooltip>
          </>}
        </div>
      </Card>
    </>
  )
}

export default ThresholdProfiles