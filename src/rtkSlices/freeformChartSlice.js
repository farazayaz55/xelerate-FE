import { createSlice } from "@reduxjs/toolkit";


export const freeformChartSlice = createSlice({
  name: "freeformChart",
  initialState: [],
  reducers: {
    setFreeformChart: (state, action) => {
      let temp = JSON.parse(JSON.stringify(state))
      return [...temp.filter(s=>s.name != action?.payload?.name).map(s=>{
        delete s.change;
        return s
      }), {...action.payload, change:true}]
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFreeformChart } = freeformChartSlice.actions;

export default freeformChartSlice.reducer;
