import { Avatar, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { memo } from 'react';
import { Logout, PersonAdd, Settings } from '@mui/icons-material';
import { ProfileMenuProps } from '../model/header.model';

function ProfileMenuComponent (props: ProfileMenuProps): JSX.Element {
  return(
    <Menu
      anchorEl={props.anchorEl}
      id="account-menu"
      open={!!props.anchorEl}
      onClose={props.handleClose}
      onClick={props.handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
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

export default memo(ProfileMenuComponent);
