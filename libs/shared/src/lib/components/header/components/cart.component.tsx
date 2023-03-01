import { memo } from 'react';
import { Avatar, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { Logout, PersonAdd, Settings } from '@mui/icons-material';
import { ProfileMenuProps } from '../model/header.model';

function CartMenuComponent(props: ProfileMenuProps) {
  return(
      <Menu
      anchorEl={props.anchorEl}
      id="account-menu"
      open={!!props.anchorEl}
      onClose={props.handleClose}
      onClick={props.handleClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={props.handleClose}>
        <Avatar /> Profile
      </MenuItem>
      <MenuItem onClick={props.handleClose}>
        <Avatar /> My accountß
      </MenuItem>
      <Divider />
      <MenuItem onClick={props.handleClose}>
        <ListItemIcon>
          <PersonAdd fontSize="small" />
        </ListItemIcon>
        Add another account
      </MenuItem>
      <MenuItem onClick={props.handleClose}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem onClick={props.handleClose}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
}

export default memo(CartMenuComponent);
