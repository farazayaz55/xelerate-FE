import React from 'react'
import Chart from "components/Charts/Semi-Donut";

const PVEnergyChart = ({pvParams}) => {
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
				name="PVEnergy"
				esb={true}
				height={"80px"}
				width={"150px"}
				padding={"75px"}
				left={"5%"}
				pvdata={[
					{
						value: pvParams.charging,
						category: "Charging",
					},
					{ value: pvParams.idle, category: "Idle" },
					{
						value: pvParams.discharging,
						category: "Discharging",
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
							{"Charging"} {`(${pvParams.charging})`}
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
							{"Idle"} {`(${pvParams.idle})`}
						</b>
					</p>
				</div>
				<div
					style={{
						padding: "2px 5px",
						borderRadius: "4px",
						backgroundColor: "rgb(186,117,216,0.1)",
					}}
				>
					<p
						style={{
							color: "#ba75d8",
							fontSize: "9px",
						}}
					>
						<b>
							{"Discharging"}{" "}
							{`(${pvParams.discharging})`}
						</b>
					</p>
				</div>
			</div>
		</span>
  )
}

export default PVEnergyChart