import * as React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export default function Media() {
  return (
    <Box>
      <Skeleton variant="rectangular" width={"100%"} height={118} />
      <Box>
        <Skeleton width="20%" />
        <Skeleton width="60%" />
      </Box>
    </Box>
  );
}
