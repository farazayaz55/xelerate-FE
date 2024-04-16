import React, { useEffect } from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useGetProfilesQuery } from 'services/services'
import { useSelector, useDispatch } from 'react-redux'
import  {setProfileList} from "rtkSlices/profilesSlice"

const ProfileSelection = ({
  solution, 
  setSolution,
  profile,
  setProfile, 
  metaDataValue, 
  newProfile,
  setNewProfile,
  setServiceForClone,
  setBlocked,
  service,
  profiles
}) => {
    const dispatch = useDispatch()
    const {profileList} = useSelector((state) => state.profiles)

    // React.useEffect(() => {
    //   if(!profiles.isFetching && profiles.isSuccess) {
    //     console.log({profiles})
    //     dispatch(setProfileList(profiles.data?.payload))
    //     setBlocked(false)
    //   } else if(profiles.isFetching){
    //     setBlocked(true)
    //   }
    // }, [profiles.isFetching, profiles.isSuccess])

    if(!profileList){
      return null
    }

    return (
      <>
        <FormControl sx={{marginLeft: "10px", width:'300px'}}>
          <InputLabel id="threshold-profile-select-label">Threshold Profile</InputLabel>
            <Select
              labelId="threshold-profile-select-label"
              id="threshold-profile-select"
              value={profile ? profile._id : ""}
              onChange={(e) => {
                const newProfileList = profileList.filter((elm) => elm._id !== "null")
                dispatch(setProfileList(newProfileList))
                setServiceForClone("")
                setProfile(profileList.find((elm) => elm._id == e.target.value))
                setNewProfile(false)
              }}
              // disabled={profiles.isLoading || profiles.isError || profileList.length == 0 ? true : false}
              disabled={(!profileList.length)}
              label="Select Threshold Profile"
            >
            {
              profiles.isSuccess && profileList.map((elm, i) => {
                return <MenuItem key={i} value={elm._id}>
                  {elm._id == "null" && <span style={{color:"red"}}>{`{New}-${profile?.name == "" ? "Profile" : ""}`}</span>}
                  {newProfile? profile.name : elm.name}
                </MenuItem>
              })
            }
          </Select>
        </FormControl>
      </>
    )
}

export default ProfileSelection