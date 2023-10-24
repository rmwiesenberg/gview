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
import React, { Dispatch, SetStateAction } from 'react'
import { GeoLayer } from '../core/GeoLayer'
import { styled } from '@mui/material/styles'
import { AddLayerDialog } from './AddLayerDialog'
import { ViewState } from '../core/ViewState'
import { MoreVert } from '@mui/icons-material'
import { LayerMenu } from './LayerMenu'
import { FlyToInterpolator } from '@deck.gl/core/typed'

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
                        checked={layer.active}
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
    layers: GeoLayer[],
    setLayers: Dispatch<SetStateAction<GeoLayer[]>>,
    setInitialViewState: React.Dispatch<React.SetStateAction<ViewState>>
) => {
    const [expanded, setExpanded] = React.useState(true)
    const [addLayer, setAddLayer] = React.useState(false)
    const [activeLayer, setActiveLayer] = React.useState<null | GeoLayer>(null)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleCloseAddLayer = (newLayers?: GeoLayer[]) => {
        setAddLayer(false)
        if (newLayers == null) return
        setLayers([...newLayers, ...layers])
    }

    const handleExpandClick = () => {
        setExpanded(!expanded)
    }

    const handleCloseLayerMenu = () => {
        setAnchorEl(null)
        setActiveLayer(null)
    }

    const handleToggle = (layer: GeoLayer) => {
        layer.active = !layer.active
        console.log(`Toggle layer active ${layer}`)
        const i = layers.indexOf(layer)
        setLayers([...layers.slice(0, i), layer, ...layers.slice(i + 1)])
    }

    const focusActiveLayer = () => {
        if (activeLayer == null) return
        if (!activeLayer.active) return
        console.log(`Focusing on ${activeLayer}`)
        const bounds = activeLayer.bounds
        if (bounds == null) return

        const lngSpan = Math.abs(bounds[0][0] - bounds[1][0])
        const latSpan = Math.abs(bounds[0][1] - bounds[1][1])

        const lng = (bounds[0][0] + bounds[1][0]) / 2
        const lat = (bounds[0][1] + bounds[1][1]) / 2
        setInitialViewState((viewState) => ({
            ...viewState,
            zoom: 180 / Math.max(lngSpan, latSpan),
            longitude: lng,
            latitude: lat,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
        }))
    }

    const deleteActiveLayer = () => {
        if (activeLayer == null) return
        activeLayer.active = !activeLayer.active
        console.log(`Remove layer ${activeLayer}`)
        const i = layers.indexOf(activeLayer)
        setLayers([...layers.slice(0, i), ...layers.slice(i + 1)])
    }

    const getLayerItems = () => {
        const listItems = []
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i]

            listItems.push(
                LayerItem(
                    layer,
                    (event: React.MouseEvent<HTMLElement>) => {
                        setAnchorEl(event.currentTarget)
                        setActiveLayer(layer)
                    },
                    () => handleToggle(layer)
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
                    <Box sx={{ ml: 2 }}>{layers.length} layer(s)</Box>
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
                focusActiveLayer,
                deleteActiveLayer
            )}
        </div>
    )
}
