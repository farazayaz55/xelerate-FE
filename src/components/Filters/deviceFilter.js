import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';

let columns = [
    {label:'Name', value:'name'},
    {label:'Serial Number', value:'serialNo'},
    {label:'Firmware', value:'firmware'},
    {label:'IMEI', value:'imei'},
    {label:'IMSI', value:'imsi'},
    {label:'ICCID', value:'iccid'},
    {label:'MSISDN', value:'msisdn'},
    {label:'Device ID', value:'internalId'},
    {label:'Custom Attributes', value:'metaTags'}
]


export default function DeviceFilter(props) {
    // const [selectedColumns, setSelectedColumns] = useState(props.filterColumns.length ? props.filterColumns : ['name'])
    let perm = props.layoutPermission?.columns;

    const selectColumn = (value,check) => {
        let selected = [...props.filterColumns];
        if(check){
            selected.push(value)
        }
        else{
            selected = selected.filter(s=>s != value)
        }
        // setSelectedColumns(selected)
        props.setFilterColumns(selected);
    }

    function filterByPermission(){
        if(!perm.includes("metaTags")){
            columns = columns.filter(c=>c.value != 'metaTags')
        }
        if(!perm.includes("deviceInfo")){
            columns = columns.filter(c=>c.value != 'serialNo' && c.value != 'firmware' && c.value != 'imei' && c.value != 'internalId' && c.value != 'imsi' && c.value != 'iccid' && c.value != 'msisdn')
        }
        return columns;
    }

    useEffect(()=>{
        let temp = [...props.filterColumns];
        // setSelectedColumns(temp.length ? temp : selectedColumns);
        props.setFilterColumns(temp.length ? temp : props.filterColumns);
    },[])

    return (
        <div style={{padding:20, paddingRight:2, maxHeight:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontSize:'13px', color:'rgb(180, 180, 180)', marginBottom:5}}>Search by </span>
                {/* <Button variant="text" sx={{fontWeight:'bold', padding:0}} color='primary' onClick={()=>props.doneFilter(selectedColumns)}>Done</Button> */}
            </div>
            {(props.layoutPermission ? filterByPermission() : columns.filter(c=>c.value!='metaTags')).map((column,i)=>{
                return (
                    <FormGroup key={i}>
                        <FormControlLabel control={<Checkbox defaultChecked={props.filterColumns?.includes(column.value)} onChange={(e)=>selectColumn(column.value, e.target.checked)} />} label={column.label} />
                    </FormGroup>
                )
            })}
        </div>
    )
}