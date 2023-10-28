import {
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Checkbox,
    Collapse,
    IconButton,
    IconButtonProps,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import React from 'react'
import { GeoLayer } from '../common/GeoLayer'
import { styled } from '@mui/material/styles'
import { AddLayerDialog } from './AddLayerDialog'
import { ViewState } from '../common/ViewState'
import { MoreVert } from '@mui/icons-material'
import { LayerMenu } from './LayerMenu'
import { FlyToInterpolator } from '@deck.gl/core/typed'
import { useAppDispatch, useAppSelector } from '../app/hook'
import { addLayers, toggleActive } from '../features/layersSlice'

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props
    return <IconButton {...other} />
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}))

const LayerItem = (
    layer: GeoLayer,
    isActive: boolean,
    handleClick: (event: React.MouseEvent<HTMLElement>) => void,
    handleToggle: () => void
) => {
    const labelId = `layer-list-item-${layer.name}`

    return (
        <div>
            <ListItem
                key={layer.name}
                secondaryAction={
                    <Tooltip title="Layer">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-haspopup="true"
                        >
                            <MoreVert sx={{ width: 32, height: 32 }} />
                        </IconButton>
                    </Tooltip>
                }
                disablePadding
            >
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        checked={isActive}
                        onChange={() => handleToggle()}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={layer.name} />
            </ListItem>
        </div>
    )
}

export const LayerList = (
    setInitialViewState: React.Dispatch<React.SetStateAction<ViewState>>
) => {
    const layersState = useAppSelector((state) => state.layers)
    const dispatch = useAppDispatch()

    const [expanded, setExpanded] = React.useState(true)
    const [addLayer, setAddLayer] = React.useState(false)
    const [activeLayer, setActiveLayer] = React.useState<null | GeoLayer>(null)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleCloseAddLayer = (newLayers?: GeoLayer[]) => {
        setAddLayer(false)
        if (newLayers == null) return
        dispatch(addLayers(newLayers))
    }

    const handleExpandClick = () => {
        setExpanded(!expanded)
    }

    const handleCloseLayerMenu = () => {
        setAnchorEl(null)
        setActiveLayer(null)
    }

    const focusActiveLayer = () => {
        if (activeLayer == null) return
        console.log(`Focusing on ${activeLayer}`)
        const bounds = activeLayer.bounds
        if (bounds == null) return

        const lngZoom = 120 / Math.abs(bounds[0][0] - bounds[1][0])
        const latZoom = 60 / Math.abs(bounds[0][1] - bounds[1][1])

        const lng = (bounds[0][0] + bounds[1][0]) / 2
        const lat = (bounds[0][1] + bounds[1][1]) / 2

        const randomOffset = () => {
            return (Math.random() - 0.5) * 1e-6
        }

        // Add small, random number to lng/lat so that zoom always works.
        setInitialViewState((viewState) => ({
            ...viewState,
            zoom: Math.min(lngZoom, latZoom),
            longitude: lng + randomOffset(),
            latitude: lat + randomOffset(),
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
        }))
    }

    const getLayerItems = () => {
        const listItems = []
        for (let layer of layersState.ordered) {
            listItems.push(
                LayerItem(
                    layer,
                    layersState.isActive[layer.id]!,
                    (event: React.MouseEvent<HTMLElement>) => {
                        setAnchorEl(event.currentTarget)
                        setActiveLayer(layer)
                    },
                    () => dispatch(toggleActive(layer))
                )
            )
        }
        return listItems
    }

    return (
        <div>
            <Card>
                <CardHeader
                    action={
                        <IconButton
                            aria-label="add layer"
                            onClick={() => setAddLayer(true)}
                        >
                            <AddIcon />
                        </IconButton>
                    }
                    title="Layers"
                />
                <CardActions disableSpacing>
                    <Box sx={{ ml: 2 }}>
                        {layersState.ordered.length} layer(s)
                    </Box>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <List>{getLayerItems()}</List>
                    </CardContent>
                </Collapse>
            </Card>
            {AddLayerDialog({
                open: addLayer,
                onClose: handleCloseAddLayer,
            })}
            {LayerMenu(
                activeLayer,
                anchorEl,
                handleCloseLayerMenu,
                focusActiveLayer
            )}
        </div>
    )
}
