import { createSlice } from "@reduxjs/toolkit";

export const profileSlice = createSlice({
  name: "profiles",
  initialState: { profileList: []},
  reducers: {
    setProfileList: (state, action) => {
      state = {
        profileList: action.payload
      };
      return state;
    },
    addProfile: (state, action) => {
      state = {
        profileList: [...state.profileList, action.payload]
      };
      state.profileList.filter((elm) => elm._id !== "null")
      return state;
    },
    editProfile: (state, action) => {
      state = {
        profileList: state.profileList.map((elm) => {
          if(elm._id == action.payload._id) {
            return action.payload
          } else {
            return elm
          }
        })
      };
      return state;
    },
    removeProfile: (state, action) => {
      state = {
        profileList: state.profileList.filter((elm) => elm._id !== action.payload)
      };
      return state;
    }
  },
});

// Action creators are generated for each case reducer function
export const { setProfileList, addProfile, editProfile, removeProfile } = profileSlice.actions;

export default profileSlice.reducer;