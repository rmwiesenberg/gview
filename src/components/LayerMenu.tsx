import { ListItemIcon, Menu, MenuItem } from '@mui/material'
import { FormatPaint, GpsFixed } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import { GeoLayer } from '../common/GeoLayer'
import { useAppDispatch } from '../app/hook'
import { removeLayer } from '../features/layersSlice'
import { focusLayer } from '../features/viewSlice'

export const LayerMenu = (
    layer: null | GeoLayer,
    anchorEl: null | HTMLElement,
    handleClose: () => void
) => {
    const dispatch = useAppDispatch()
    const open = Boolean(anchorEl)
    return (
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
                paper: {
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
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            {layer?.bounds != null && (
                <MenuItem
                    onClick={() => {
                        if (layer != null) dispatch(focusLayer(layer))
                        handleClose()
                    }}
                >
                    <ListItemIcon>
                        <GpsFixed fontSize="small" />
                    </ListItemIcon>
                    Focus on layer
                </MenuItem>
            )}
            <MenuItem
                onClick={() => {
                    handleClose()
                }}
            >
                <ListItemIcon>
                    <FormatPaint fontSize="small" />
                </ListItemIcon>
                Edit style
            </MenuItem>
            <MenuItem
                onClick={() => {
                    if (layer != null) dispatch(removeLayer(layer))
                    handleClose()
                }}
            >
                <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                </ListItemIcon>
                Delete layer
            </MenuItem>
        </Menu>
    )
}
