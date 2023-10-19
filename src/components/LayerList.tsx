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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import React, { Dispatch, SetStateAction } from 'react'
import { GeoLayer } from '../core/GeoLayer'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import { AddLayerDialog } from './AddLayerDialog'

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
    handleToggle: CallableFunction,
    handleDelete: CallableFunction
) => {
    const labelId = `layer-list-item-${layer.name}`

    return (
        <ListItem
            key={layer.name}
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete()}
                >
                    <DeleteIcon />
                </IconButton>
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
    )
}

export const LayerList = (
    layers: GeoLayer[],
    setLayers: Dispatch<SetStateAction<GeoLayer[]>>
) => {
    const [addLayer, setAddLayer] = React.useState(false)
    const [expanded, setExpanded] = React.useState(true)

    const handleCloseAddLayer = (newLayer?: GeoLayer) => {
        setAddLayer(false)
        if (newLayer == null) return
        setLayers([newLayer, ...layers])
    }

    const handleExpandClick = () => {
        setExpanded(!expanded)
    }

    const getLayerItems = () => {
        const listItems = []
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i]
            listItems.push(
                LayerItem(
                    layer,
                    () => {
                        layer.active = !layer.active
                        console.log(`Toggle layer active ${layer}`)
                        setLayers([
                            ...layers.slice(0, i),
                            layer,
                            ...layers.slice(i + 1),
                        ])
                    },
                    () => {
                        layer.active = !layer.active
                        console.log(`Remove layer ${layer}`)
                        setLayers([
                            ...layers.slice(0, i),
                            ...layers.slice(i + 1),
                        ])
                    }
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
        </div>
    )
}
