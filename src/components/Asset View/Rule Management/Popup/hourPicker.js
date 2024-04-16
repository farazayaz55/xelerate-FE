import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./hourPicker.css";
import Button from "@mui/material/Button";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { IconButton } from "@mui/material";

const days = [
  { value: 0, name: "Sunday" },
  { value: 1, name: "Monday" },
  { value: 2, name: "Tuesday" },
  { value: 3, name: "Wednesday" },
  { value: 4, name: "Thursday" },
  { value: 5, name: "Friday" },
  { value: 6, name: "Saturday" },
];

const getUtcHour = (val) => {
  let d = new Date();
  d.setHours(val);
  return d.getUTCHours() + ":00:00";
};

const hours = [
  { name: "00:00", value: { timeFrom: getUtcHour(24), timeTo: getUtcHour(1) } },
  { name: "1:00", value: { timeFrom: getUtcHour(1), timeTo: getUtcHour(2) } },
  { name: "2:00", value: { timeFrom: getUtcHour(2), timeTo: getUtcHour(3) } },
  { name: "3:00", value: { timeFrom: getUtcHour(3), timeTo: getUtcHour(4) } },
  { name: "4:00", value: { timeFrom: getUtcHour(4), timeTo: getUtcHour(5) } },
  { name: "5:00", value: { timeFrom: getUtcHour(5), timeTo: getUtcHour(6) } },
  { name: "6:00", value: { timeFrom: getUtcHour(6), timeTo: getUtcHour(7) } },
  { name: "7:00", value: { timeFrom: getUtcHour(7), timeTo: getUtcHour(8) } },
  { name: "8:00", value: { timeFrom: getUtcHour(8), timeTo: getUtcHour(9) } },
  { name: "9:00", value: { timeFrom: getUtcHour(9), timeTo: getUtcHour(10) } },
  {
    name: "10:00",
    value: { timeFrom: getUtcHour(10), timeTo: getUtcHour(11) },
  },
  {
    name: "11:00",
    value: { timeFrom: getUtcHour(11), timeTo: getUtcHour(12) },
  },
  {
    name: "12:00",
    value: { timeFrom: getUtcHour(12), timeTo: getUtcHour(13) },
  },
  {
    name: "13:00",
    value: { timeFrom: getUtcHour(13), timeTo: getUtcHour(14) },
  },
  {
    name: "14:00",
    value: { timeFrom: getUtcHour(14), timeTo: getUtcHour(15) },
  },
  {
    name: "15:00",
    value: { timeFrom: getUtcHour(15), timeTo: getUtcHour(16) },
  },
  {
    name: "16:00",
    value: { timeFrom: getUtcHour(16), timeTo: getUtcHour(17) },
  },
  {
    name: "17:00",
    value: { timeFrom: getUtcHour(17), timeTo: getUtcHour(18) },
  },
  {
    name: "18:00",
    value: { timeFrom: getUtcHour(18), timeTo: getUtcHour(19) },
  },
  {
    name: "19:00",
    value: { timeFrom: getUtcHour(19), timeTo: getUtcHour(20) },
  },
  {
    name: "20:00",
    value: { timeFrom: getUtcHour(20), timeTo: getUtcHour(21) },
  },
  {
    name: "21:00",
    value: { timeFrom: getUtcHour(21), timeTo: getUtcHour(22) },
  },
  {
    name: "22:00",
    value: { timeFrom: getUtcHour(22), timeTo: getUtcHour(23) },
  },
  {
    name: "23:00",
    value: { timeFrom: getUtcHour(23), timeTo: getUtcHour(24) },
  },
];
export default function HourPicker({
  setOpen,
  setMuteNotifications,
  muteNotifications,
  payload,
}) {
  let tempTimes = [];

  const [selectedTimes, setSelectedTimes] = React.useState(
    tempTimes.length ? tempTimes : []
  );

  const timeSet = (day, hour) => {
    let index = selectedTimes.findIndex(
      (s) => s.day == day && JSON.stringify(s.hour) == JSON.stringify(hour)
    );
    if (index != -1) {
      let temp = [...selectedTimes];
      temp.splice(index, 1);
      setSelectedTimes(temp);
    } else {
      setSelectedTimes([...selectedTimes, { day: day, hour: hour }]);
    }
  };

  const submit = () => {
    let temp = { ...payload };
    selectedTimes.forEach((time) => {
      if (!temp[time.day]) {
        temp[time.day] = [];
      }
      temp[time.day] = [...temp[time.day], time.hour];
    });
    if (!selectedTimes.length) {
      // temp = {
      //   "0": [],

      //   "1": [],

      //   "2": [],

      //   "3": [],

      //   "4": [],

      //   "5": [],

      //   "6": [],
      // };

      setMuteNotifications(temp);
    } else {
      setMuteNotifications(temp);
    }
    setOpen(false);
  };

  useEffect(() => {
    document.getElementsByTagName("body")[0].click();
    days.forEach((d) => {
      document
        .getElementById("row-day-" + d.value)
        .addEventListener("mouseover", () => {
          document.getElementById("day-" + d.value).style.visibility =
            "inherit";
        });
      document
        .getElementById("row-day-" + d.value)
        .addEventListener("mouseleave", () => {
          document.getElementById("day-" + d.value).style.visibility = "hidden";
        });
    });
    hours.forEach((h, i) => {
      document
        .getElementById("row-hour-" + i)
        .addEventListener("mouseover", () => {
          document.getElementById("hour-" + i).style.visibility = "inherit";
        });
      document
        .getElementById("row-hour-" + i)
        .addEventListener("mouseleave", () => {
          document.getElementById("hour-" + i).style.visibility = "hidden";
        });
    });

    let tempSelectedTimes = [...selectedTimes];
    let tempPayload = {
      "0": [],

      "1": [],

      "2": [],

      "3": [],

      "4": [],

      "5": [],

      "6": [],
    };
    let cond = JSON.stringify(tempPayload) != JSON.stringify(muteNotifications);
    let cond2 = JSON.stringify(tempPayload) != JSON.stringify(payload);
    if (cond || cond2) {
      Object.keys(cond ? muteNotifications : payload).forEach((noti) => {
        if (cond) {
          muteNotifications[noti].forEach((m) => {
            tempSelectedTimes.push({
              day: noti,
              hour: { timeFrom: m.timeFrom, timeTo: m.timeTo },
            });
          });
        } else {
          payload[noti].forEach((m) => {
            tempSelectedTimes.push({
              day: noti,
              hour: { timeFrom: m.timeFrom, timeTo: m.timeTo },
            });
          });
        }
      });
      setSelectedTimes(tempSelectedTimes);
      tempTimes = tempSelectedTimes;
    }
    setTimeout(() => {
      document.getElementById("div").click();
    }, 500);
  }, []);

  const reset = () => {
    setSelectedTimes([]);
  };

  function checkForAll(day) {
    return selectedTimes.filter((s) => s.day == day.value).length == 24
      ? true
      : false;
  }

  function checkForAllDays(hour) {
    return selectedTimes.filter((s) => s.hour == hour.value).length == 7
      ? true
      : false;
  }

  const checkAll = (day) => {
    let tempSelectedTimes = [...selectedTimes];
    if (checkForAll(day)) {
      tempSelectedTimes = tempSelectedTimes.filter((t) => t.day != day.value);
    } else {
      tempSelectedTimes = tempSelectedTimes.filter((t) => t.day != day.value);
      hours.forEach((hour) => {
        tempSelectedTimes.push({ day: day.value, hour: hour.value });
      });
    }
    setSelectedTimes(tempSelectedTimes);
  };

  const checkAllDays = (hour) => {
    let tempSelectedTimes = [...selectedTimes];
    if (checkForAllDays(hour)) {
      tempSelectedTimes = tempSelectedTimes.filter((t) => t.hour != hour.value);
    } else {
      tempSelectedTimes = tempSelectedTimes.filter((t) => t.hour != hour.value);
      days.forEach((day) => {
        tempSelectedTimes.push({ day: day.value, hour: hour.value });
      });
    }
    setSelectedTimes(tempSelectedTimes);
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid rgb(245,245,245)",
          borderRadius: 4,
          margin: "10px 30px 10px 30px",
        }}
        id="div"
      >
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: 1800,
              maxHeight: 550,
              boxShadow: "none !important",
            }}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead sx={{ padding: "0px !important" }}>
                <TableRow
                  sx={{
                    padding: "0px !important",
                    background: "lightgrey",
                    border: "none !important",
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ backgroundColor: "lightgrey", fontSize: 11 }}
                  >
                    Days
                  </TableCell>
                  {hours.map((hour, ind) => {
                    return (
                      <TableCell
                        id={`row-hour-${ind}`}
                        align="center"
                        sx={{
                          backgroundColor: "lightgrey",
                          fontSize: 11,
                          // padding:ind == 0 ? '20px 0px 20px 25px !important' : ind==hours.length-1 ? '20px 25px 20px 0px !important' : '20px 0px !important'
                        }}
                      >
                        {hour.name}
                        <div
                          style={{
                            position: "absolute",
                            marginTop: "-10px",
                            marginLeft: "-3px",
                          }}
                        >
                          <IconButton
                            id={`hour-${ind}`}
                            style={{ visibility: "hidden" }}
                            color="secondary"
                            onClick={() => checkAllDays(hour)}
                          >
                            <DoneAllIcon
                              style={{
                                cursor: "pointer",
                                height: "15px",
                                width: "15px",
                              }}
                            />
                          </IconButton>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {days.map((day) => (
                  <TableRow
                    id={`row-day-${day.value}`}
                    key={day.value}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      padding: "0px !important",
                      border: "none !important",
                    }}
                  >
                    <TableCell
                      align="center"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <IconButton
                        id={`day-${day.value}`}
                        style={{ visibility: "hidden" }}
                        color="secondary"
                        onClick={() => checkAll(day)}
                      >
                        <DoneAllIcon
                          style={{
                            cursor: "pointer",
                            height: "15px",
                            width: "15px",
                          }}
                        />
                      </IconButton>
                      <div>{day.name}</div>
                    </TableCell>
                    {hours.map((hour, ind) => {
                      return (
                        <TableCell
                          sx={{
                            fontSize: 8,
                            //  padding:ind == 0 ? '0px 0px 0px 25px !important' : ind==days.length-1 ? '0px 25px 0px 0px !important' : '0px !important',
                          }}
                          align="center"
                        >
                          {selectedTimes.find(
                            (s) =>
                              s.day == day.value &&
                              JSON.stringify(s.hour) ==
                                JSON.stringify(hour.value)
                          ) ? (
                            <CancelOutlinedIcon
                              style={{ cursor: "pointer" }}
                              onClick={() => timeSet(day.value, hour.value)}
                              color="error"
                            />
                          ) : (
                            <CheckCircleOutlinedIcon
                              style={{ cursor: "pointer" }}
                              onClick={() => timeSet(day.value, hour.value)}
                              color="success"
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 13,
          width: "100%",
          padding: "13px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "3%",
            marginTop: "6px",
            fontSize: 12,
            color: "#444",
            display: "flex",
            gap: 4,
          }}
        >
          <span>
            <CancelOutlinedIcon
              color="error"
              size="small"
              sx={{ fontSize: 21 }}
            />
          </span>
          <div style={{ marginTop: "-1px" }}>
            Notifications will be suppressed
          </div>
        </div>
        <Button onClick={() => setOpen(false)} color="error">
          Cancel
        </Button>
        <Button onClick={reset} color="warning">
          Reset
        </Button>
        <Button color="secondary" onClick={submit}>
          Ok
        </Button>
      </div>
    </div>
  );
}
