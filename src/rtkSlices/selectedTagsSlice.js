import { createSlice } from "@reduxjs/toolkit";


export const selectedTagsSlice = createSlice({
  name: "selectedTags",
  initialState: [],
  reducers: {
    setSelectedTags: (state, action) => {
      return action.payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedTags } = selectedTagsSlice.actions;

export default selectedTagsSlice.reducer;
