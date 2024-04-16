//-------------CORE-------------//
import React, { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
//-------------MUI-------------//
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Skeleton from "@mui/material/Skeleton";
//----------MUI Icon--------------//
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
//----------EXTERNAL COMPS--------//
import Price from "./Price";
import Table from "components/Table/newTable";
import Loader from "components/Progress";
import { useGetBillQuery, useGetBillListQuery } from "services/devices";

export default function Billing() {
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const metaData = useSelector((state) => state.metaData?.services);
  const [loader, setLoader] = useState(true);
  const [rows, setRowState] = useState([]);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [startTime, setStartTime] = React.useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endTime, setEndTime] = React.useState(new Date());
  const [selectedSolutions, setSelectedSolutions] = React.useState(
    metaData.map((e) => e.id)
  );

  const { enqueueSnackbar } = useSnackbar();

  function getClass(count) {
    if (count < 1) {
      return "A";
    } else if (count >= 1 && count <= 6) {
      return "B";
    } else if (count >= 7 && count <= 60) {
      return "C";
    } else if (count >= 61 && count <= 360) {
      return "D";
    } else if (count >= 361 && count <= 3600) {
      return "E";
    } else if (count > 3600) {
      return "F";
    }
  }

  const bill = useGetBillQuery({
    token,
    params: `?dateTo=${endTime.toISOString()}&dateFrom=${startTime.toISOString()}&serviceId=${JSON.stringify(
      selectedSolutions
    )}`,
  });

  const billList = useGetBillListQuery({
    token,
    params: `?dateTo=${endTime.toISOString()}&dateFrom=${startTime.toISOString()}&serviceId=${JSON.stringify(
      selectedSolutions
    )}&pageSize=25&currentPage=${currentPage}`,
  })

  const allBillingList=useGetBillListQuery({
    token,
    params: `?dateTo=${endTime.toISOString()}&dateFrom=${startTime.toISOString()}&serviceId=${JSON.stringify(
      selectedSolutions
    )}&pageSize=${billList?.data?.payload?.totalDocuments==0?10:billList?.data?.payload?.totalDocuments}&currentPage=1`,
  },{
    skip:billList.isFetching
  })

  async function fetchList() {
    if (billList.isSuccess && billList.data?.payload) {
      // setLoader(false);
      // let temp = [];
      // billList.data.payload?.data?.forEach((elm) => {
      //   let time = new Date(elm.time);
      //   temp.push(
      //     createData(
      //       elm.name,
      //       elm.device,
      //       metaData.find((e) => elm.serviceId == e.id).name,
      //       getClass(elm.count),
      //       `${time.toLocaleDateString("en-GB")} ${time.toLocaleTimeString()}`
      //     )
      //   );
      // });
      // setRowState(temp);
      // setLoader(false);
    } else if (
      !billList.isFetching &&
      billList.isError &&
      billList.data?.message != ""
    ) {
      showSnackbar("Billing", billList.data?.message, "error", 1000);
    }
  }

  useEffect(() => {
    fetchList();
  }, [billList.isFetching]);

  useEffect(()=>{
    if (allBillingList.isSuccess && allBillingList.data?.payload){
    let temp = [];
    allBillingList.data.payload?.data?.forEach((elm) => {
      let time = new Date(elm.time);
      temp.push(
        createData(
          elm.name,
          elm.device,
          metaData.find((e) => elm.serviceId == e.id).name,
          getClass(elm.count),
          `${time.toLocaleDateString("en-GB")} ${time.toLocaleTimeString()}`
        )
      );
    });
    setRowState(temp);
    setLoader(false)
  }
  },[allBillingList.isFetching])

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function createData(name, id, solution, html, time) {
    return {
      name,
      id,
      solution,
      html,
      time,
    };
  }

  var html = (row) => {
    return (
      <p
        style={{
          color: metaDataValue.branding.primaryColor,
          fontSize: "16px",
          fontWeight: "900",
          marginLeft: "10px",
        }}
      >
        {row.html}
      </p>
    );
  };

  const pageChange = (newPage) => {
    setCurrentPage(newPage);
    if (newPage > page) {
      setLoader(true);
      setPage(newPage);
    } else {
      setLoader(true);
      setPage(newPage);
    }
  };

  const cardFunc=useCallback(React.memo(()=> {
    return (
      <Table
        columns={[
          { id: "name", label: "Name", align: "center" },
          { id: "id", label: "Id", align: "center" },
          { id: "solution", label: "Solution", align: "center" },
          { id: "html", label: "Class", align: "center" },
          { id: "time", label: "Time", align: "center" },
        ]}
        rows={rows}
        html={html}
        page={currentPage}
        totalPages={billList.data.payload.totalPages}
        totalDocuments={billList.data.payload.totalDocuments}
        handleChange={pageChange}
        height="calc(100vh - 530px)"
        pageSize={25}
      />
    );
  }),[])

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSolutions(typeof value === "string" ? value.split(",") : value);
  };

  function ifLoaded(state, component) {
    if (state) return <Loader top="20vh" />;
    else return component();
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Price />
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="filterBySolution">Filter By Solution</InputLabel>
          <Select
            id="filterBySolution-checkbox"
            multiple
            value={selectedSolutions}
            onChange={handleChange}
            input={<OutlinedInput label="Filter By Solution" />}
            renderValue={(selected) =>
              selected
                .map((e) => metaData.find((a) => a.id == e).name)
                .join(", ")
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 400,
                  width: 300,
                },
              },
            }}
            sx={{ marginRight: "5px" }}
          >
            {metaData.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                <Checkbox checked={selectedSolutions.indexOf(e.id) > -1} />
                <ListItemText primary={e.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Start Time"
            inputFormat="dd/MM/yyyy h:mm:ss aaa"
            value={startTime}
            onChange={(newValue) => {
              setStartTime(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="dense"
                sx={{
                  width: 200,
                  borderRadius: "10px",
                  height: "40px",
                  marginRight: "15px",
                  position: "relative",
                  bottom: "9px",
                }}
              />
            )}
          />
          <DateTimePicker
            maxDate={new Date(endTime)}
            label="End Time"
            value={endTime}
            onChange={(newValue) => {
              setEndTime(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="dense"
                sx={{
                  width: 200,
                  borderRadius: "10px",
                  height: "40px",
                  marginRight: "15px",
                  position: "relative",
                  bottom: "9px",
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          <Card
            style={{
              padding: "15px",
              fontSize: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "40px",
              height: "174px",
              width: "400px",
            }}
          >
            {bill.isFetching || allBillingList.isFetching ? (
              <Loader />
            ) : (
              <>
                <span>
                  <p style={{ paddingBottom: "15px" }}>
                    <b style={{ color: "gray" }}>Total Devices:</b>
                  </p>
                  <p>
                    <b style={{ color: "gray" }}>Total Bill:</b>
                  </p>
                </span>
                <span>
                  <p style={{ paddingBottom: "15px" }}>
                    {bill?.data?.payload?.totalDevices}
                  </p>
                  <p>{bill?.data?.payload?.bill} €</p>
                </span>
              </>
            )}
          </Card>

          <Card
            style={{
              padding: "15px",
              fontSize: "18px",
              display: "flex",
              justifyContent: "space-between",
              gap: "40px",
              height: "174px",
              width: "calc(100vw - 520px)",
            }}
          >
            {bill.isFetching || allBillingList.isFetching? (
              <Loader />
            ) : (
              <span style={{ width: "100%" }}>
                {[
                  { name: "A", range: "(>1)" },
                  { name: "B", range: "(1-6)" },
                  { name: "C", range: "(7-60)" },
                  { name: "D", range: "(61-360)" },
                  { name: "E", range: "(361-3600)" },
                  { name: "F", range: "(>3600)" },
                ].map((e) => {
                  return (
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "40px",
                        width: "100%",
                      }}
                    >
                      <p style={{ color: "gray" }}>
                        Band {e.name} {e.range} :{" "}
                        <span style={{ color: "black" }}>
                          {bill?.data?.payload?.classes[e.name]?.count
                            ? bill?.data?.payload?.classes[e.name]?.count
                            : 0}{" "}
                        </span>
                        <span
                          style={{
                            color: "black",
                            marginLeft: "10px",
                            marginRight: "10px",
                          }}
                        >
                          devices
                        </span>
                        <span style={{ color: "black" }}>
                          (
                          {(
                            ((bill?.data?.payload?.classes[e.name]?.count
                              ? bill?.data?.payload?.classes[e.name]?.count
                              : 0) /
                              bill?.data?.payload?.totalDevices) *
                            100
                          ).toFixed(2)}{" "}
                          ) %
                        </span>
                      </p>
                      <p>
                        <span style={{ color: "gray" }}>Total Bill:</span>{" "}
                        {bill?.data?.payload?.classes[e.name]?.count
                          ? bill?.data?.payload?.classes[e.name]?.count
                          : 0}{" "}
                        €
                      </p>
                    </span>
                  );
                })}
              </span>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div
          style={{
            margin: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ display: "flex", gap: "40px", alignItems: "center" }}>
            <p
              style={{ color: "rgb(191, 190, 200)", fontSize: "15px", flex: 1 }}
            >
              <b>Billing</b>
            </p>
          </span>
          <MonetizationOnIcon color="disabled" />
        </div>
        <div
          style={{
            margin: "20px",
            minHeight: "50vh",
          }}
        >
          {ifLoaded(loader, cardFunc)}
        </div>
      </Card>
    </>
  );
}
