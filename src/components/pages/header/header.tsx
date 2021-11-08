import React from 'react';
import './header.css';

import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Img from '../../../images/fox.png';

const Header = () => {
    return (
        <div className="i_header"> 
            {/* <div className="ih_left">
                <SearchIcon sx={{ fontSize: 15 }}/>
                <span className="ih_text">Type of Cryptocurrency</span>
            </div> */}
            <div className="ih_right">
                {/* <SettingsIcon  sx={{ fontSize: 15 }}/>
                <NotificationsIcon className="ih_alert" sx={{ fontSize: 15 }}/> */}
                <img className="ih_img" src={Img} width="30" height="30"></img>
                <span className="ih_rtext">Wallet Connected</span>
            </div>
        </div>
    );
}

export { Header };