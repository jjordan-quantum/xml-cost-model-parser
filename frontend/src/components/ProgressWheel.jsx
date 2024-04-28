import {CircularProgress, useTheme} from "@mui/material";
import React from "react";
import {tokens} from "../theme";

const ProgressWheel = () => {
    const indicatorSize = 80;

    // =================================================================================================================
    //
    //  set up theme
    //
    // =================================================================================================================

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <CircularProgress
            size={indicatorSize}
            //color='yellow'
            sx={{
                // display: "flex",
                // alignItems: "center",
                // height: "100%",
                position: 'fixed',
                top: '50%',
                left: '50%',
                marginTop: `${-indicatorSize/2}px`,
                marginLeft: `${-indicatorSize/2}px`,
                color: colors.greenAccent[300]
            }}
        />
    );
}

export default ProgressWheel;
