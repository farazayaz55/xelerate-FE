import { createSlice } from "@reduxjs/toolkit";


export const alarmsFilterSlice = createSlice({
  name: "alarmsFilter",
  initialState: {
          date: {
            startTime: new Date().setDate(new Date().getDate() - 7),
            endTime: new Date().setDate(new Date().getDate())
          },
          status: ["ACTIVE","ACKNOWLEDGED"],
          solutions: ['All'],
          priority: [],
          emails: false,
          actuations: false,
          search: {
            asset: "",
            rule: ""
          }
        },
  reducers: {
    setAlarmsFilter: (state, action) => {
      return action.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAlarmsFilter } = alarmsFilterSlice.actions;

export default alarmsFilterSlice.reducer;
