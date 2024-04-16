import React, {useState} from 'react'
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
import Pin from "assets/img/location-pin.png";

const AssetInfoCard = (props) => {
	const metaDataValue = useSelector((state) => state.metaData);
	const filtersValue = useSelector((state) => state.filterDevice);

  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );

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
					justifyContent: "center",
					alignItems: "center",
					overflow: "hidden",
				}}
			>
				<img
					src={props.asset.image || Pin}
					style={{
						maxWidth: "200px",
						maxHeight:
							filtersValue.group.name != "All assets"
								? "85px"
								: "120px",
					}}
				></img>
			</div>

			<div
				style={{
					backgroundColor: isSelected(props.asset.id) ? `rgba(76, 175, 80, 0.1)` : "rgb(85, 85, 85, 0.1)",
					padding: "4px 6px 4px 6px",
					borderRadius: "10px",
				}}
			>
				<p
					style={{
						color: metaDataValue.branding.secondaryColor,
						fontSize: "12px",
					}}
				>
					<b id="assetInfo_1" style={{
						color: isSelected(props.asset.id) ? `rgb(76, 175, 80)` : "rgb(85, 85, 85)",
						lineHeight: "15px",
						textAlign: "center"
					}}
						>
						<div>
							<div>
								{`${props.asset.name} (${props.multipleAssets ? filtersValue?.devicesCount?.[props.asset.id] || 0 : filtersValue?.noOfDevices})`}
							</div>
							{props.multipleAssets ? <div style={{
								fontSize: "10px",
								fontWeight: "500"
							}}>
								{`Total Assets: ${filtersValue.noOfDevices}`}
							</div> : null}	
						</div>
					</b>
				</p>
			</div>
{/* 
			{props.multipleAssets ? <div 
				style={{
					position: "absolute", 
					bottom: "-15px", 
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