import React from 'react'
import Chart from "components/Charts/Semi-Donut";

const EVEnergyChart = ({evParams, setDisposed}) => {
  return (
    <span
			style={{
					position: "relative",
					top: "-10px",
					width: "100%",
					height: "130px",
			}}
		>
			<Chart
					name="EVEnergyChart"
					setDisposed={setDisposed}
					esb={true}
					ev={true}
					height={"80px"}
					width={"150px"}
					padding={"75px"}
					left={"5%"}
					evdata={[
					{
							value: evParams.charging,
							category: "Charging",
					},
					{ value: evParams.idle, category: "Idle" },
					{
							value: evParams.malfunction,
							category: "Malfunctioned",
					},
					// {value: 2, category: 'Active'}
					]}
			/>
			<div
					style={{
					display: "flex",
					justifyContent: "center",
					flexWrap: "wrap",
					marginTop: "1px",
					}}
			>
					<div
					style={{
							padding: "2px 5px",
							borderRadius: "4px",
							backgroundColor: "rgb(95,183,98,0.1)",
					}}
					>
					<p
							style={{
							color: "#5fb762",
							fontSize: "9px",
							}}
					>
							<b>
							{"Charging"} {`(${evParams.charging})`}
							</b>
					</p>
					</div>
					<div
					style={{
							padding: "2px 5px",
							borderRadius: "4px",
							backgroundColor: "rgb(85,85,85,0.1)",
					}}
					>
					<p
							style={{
							color: "#555555",
							fontSize: "9px",
							}}
					>
							<b>
							{"Idle"} {`(${evParams.idle})`}
							</b>
					</p>
					</div>
					<div
					style={{
							padding: "2px 5px",
							borderRadius: "4px",
							backgroundColor: "rgb(191,53,53,0.1)",
					}}
					>
					<p
							style={{
							color: "#bf3535",
							fontSize: "9px",
							}}
					>
							<b>
							{"Malfunction"}{" "}
							{`(${evParams.malfunction})`}
							</b>
					</p>
					</div>
			</div>
    </span>
  )
}

export default EVEnergyChart