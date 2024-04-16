import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetReadingsQuery } from "services/monitoring";
import { setPlaybackDatapoints } from "rtkSlices/playbackDatapointsSlice";
import "../playback.css";

let count = {};

export default function Datapoint(props) {
  const dispatch = useDispatch();
  const playbackDatapoints = useSelector((state) => state.playbackDatapoints);
  const [datapointValues, setDatapointValues] = useState(
    playbackDatapoints && Object.keys(playbackDatapoints).length && (props.event) && playbackDatapoints[props.event._id] && playbackDatapoints[props.event._id][0]
      ? playbackDatapoints[props.event._id][0].reading
      : {}
  );
  const eventDatapoints = useGetReadingsQuery(
    {
      id: props.id,
      parameter: `?currentPage=1&pageSize=1&dataPoints=${JSON.stringify(props.sensors.map(s=>s.name))}&dateFrom=${
        props.event
          ? new Date(
              new Date(props.event.time).setFullYear(
                new Date(props.event.time).getFullYear() - 50
              )
            ).toISOString()
          : ""
      }&dateTo=${props.event ? new Date(props.event.time).toISOString() : ""}`,
    },
    {
      skip: !props.event || !props.selectedEvent || props.previousDatapoints || (props.selectedEvent[props.selectedEvent.length-1]?._id != props.event._id),
    }
  );

  useEffect(() => {
    if (!eventDatapoints.isFetching && eventDatapoints.isSuccess) {
      if(eventDatapoints.data?.payload?.data.length && !Object.keys(datapointValues).length){
        setDatapointValues(eventDatapoints.data?.payload?.data[0].reading)
        props.setLoader(false)
      }
      let obj = eventDatapoints.data.payload.data[0];
      // count[props.event._id] = count[props.event._id]
      //   ? count[props.event._id] + 1
      //   : 1;
      // if (count[props.event._id] == props.length) {
      //   props.setLoader(false);
      //   delete count[props.event._id];
      // }
      if (obj && obj._id) {
        // setDatapointValues(obj);
        let tempDatapoints = { ...playbackDatapoints };
        if (tempDatapoints[props.event._id]) {
          if (tempDatapoints[props.event._id].find((p) => p._id != obj._id)) {
            tempDatapoints[props.event._id] = Object.assign(
              [],
              tempDatapoints[props.event._id]
            );
            tempDatapoints[props.event._id].push(obj);
          }
        } else {
          tempDatapoints[props.event._id] = [obj];
        }
        dispatch(setPlaybackDatapoints(tempDatapoints));
      }
    }
    // if (!eventDatapoints.isFetching && eventDatapoints.isError) {
    //   // let loader = { ...props.loader };
    //   // loader[props.name] = true;
    //   // props.setLoader(loader);
    // }
  }, [eventDatapoints.isFetching]);

  // useEffect(() => {
  //   if (props.previousDatapoints) {
  //     let loader = { ...props.loader };
  //     loader[props.name] = true;
  //     props.setLoader(loader);
  //   }
  // }, [props.previousDatapoints]);

  return (
    <div style={{display:'flex',gap:'10px', justifyContent:'center', alignItems:'center', width:'max-content', overflow:'hidden'}}>
      {
        props.sensors.map(datapoint=>{
          return <div
        style={{
          // display: "flex",
          // justifyContent: "space-between",
          color: "#999",
          padding: "0px 10px",
          fontSize: "11px",
        }}
        key={datapoint?._id}
      >
        <div>{(datapoint?.friendlyName)?.replace(" ", "")}</div>
        <div>
          {
            datapointValues && datapointValues[datapoint?.name] ?
            datapointValues[datapoint?.name].value.toFixed(2) + datapointValues[datapoint?.name].unit :
            '-'
          }
        </div>
      </div>
        })
      }
    </div>
  );
}
