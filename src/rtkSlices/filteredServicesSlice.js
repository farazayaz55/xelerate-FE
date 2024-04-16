import { createSlice } from "@reduxjs/toolkit";


export const filteredServicesSlice = createSlice({
  name: "filteredServices",
  initialState: null,
  reducers: {
    setFilteredServices: (state, action) => {
      return action.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFilteredServices } = filteredServicesSlice.actions;

export default filteredServicesSlice.reducer;
