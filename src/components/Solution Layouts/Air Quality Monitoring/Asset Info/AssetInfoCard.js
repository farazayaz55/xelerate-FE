import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import Pin from "assets/img/location-pin.png";

const AssetInfoCard = (props) => {
	const metaDataValue = useSelector((state) => state.metaData);
	const filtersValue = useSelector((state) => state.filterDevice);

	const isSelected = (id) => {
    if(filtersValue.assetTypes == null) {
      return true
    } else {
      if(filtersValue.assetTypes.includes(id)){
        return true
      } else {
        return false
      }
    }
  }

  return (
    <>
    	<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					overflow: "hidden",
					marginTop: props.multipleAssets ? "15px" : "1px",
				}}
			>
				<img
					src={props.asset.image || Pin}
					style={{
						maxWidth: "200px",
						maxHeight: filtersValue.group.name != "All assets" ? "75px" : "120px",
					}}
				></img>
			</div>

			<div
				style={{
					backgroundColor: isSelected(props.asset.id) ? "rgb(121, 195, 124, 0.1)" : "rgb(85, 85, 85, 0.1)",
					padding: "6px",
					borderRadius: "10px",
					width: "100%",
					color: isSelected(props.asset.id) ? "#79c37c": "rgb(85, 85, 85)",
					textAlign: "center",
					height: props.multipleAssets ? "50px" : "100%"
				}}
			>
				{props.multipleAssets ? (
					<div style={{
						lineHeight: "15px",
						textAlign: "center",
						marginTop: "5px"
					}}>
						<div style={{fontWeight: "bold", fontSize: "13px"}}>
							{`${props.asset.name} (${filtersValue?.devicesCount?.[props.asset.id] || 0})`}
						</div>
						<div style={{
							fontSize: "10px",
							fontWeight: "500"
						}}>
							{`Total Assets: ${filtersValue.noOfDevices}`}
						</div>
					</div>
				) : (
					<>
						<p
							style={{
								fontSize: "22px",
								marginBottom: "5px",
							}}
						>
							<b>{filtersValue?.noOfDevices}</b>
						</p>
						<p
							style={{
								fontSize: "12px",
							}}
						>
							<b>{props.asset.name}</b>
						</p>
					</>
			)}
			</div>
			{/* {props.multipleAssets ? <div 
				style={{
					position: "absolute", 
					bottom: "5px", 
					right: "5px", 
					backgroundColor: "rgb(121, 195, 124, 0.1)", 
					borderRadius: "10px", 
					fontSize: "11px",
					paddingInline: "5px",
					fontWeight: "bold",
					color: "rgb(121, 195, 124)"
				}}>
				{`Assets: ${filtersValue.noOfDevices}`}
			</div> : null} */}
    </>
  )
}

export default AssetInfoCard