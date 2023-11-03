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
import { DragHandle, MoreVert } from '@mui/icons-material'
import { LayerMenu } from './LayerMenu'
import { useAppDispatch, useAppSelector } from '../app/hook'
import { reorder, toggleActive } from '../features/layersSlice'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

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

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
        background: 'rgb(235,235,235)',
    }),
})

export const useStrictDroppable = (loading: boolean) => {
    const [enabled, setEnabled] = React.useState(false)

    React.useEffect(() => {
        let animation: any

        if (!loading) {
            animation = requestAnimationFrame(() => setEnabled(true))
        }

        return () => {
            cancelAnimationFrame(animation)
            setEnabled(false)
        }
    }, [loading])

    return [enabled]
}

export const LayerList = () => {
    const layersState = useAppSelector((state) => state.layers)
    const dispatch = useAppDispatch()

    const [expanded, setExpanded] = React.useState(true)
    const [isAddLayerActive, setIsAddLayerActive] = React.useState(false)
    const [activeLayer, setActiveLayer] = React.useState<null | GeoLayer>(null)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [droppingEnabled] = useStrictDroppable(false)

    const handleExpandClick = () => {
        setExpanded(!expanded)
    }

    const handleCloseLayerMenu = () => {
        setAnchorEl(null)
        setActiveLayer(null)
    }

    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return
        }

        dispatch(
            reorder({
                start: result.source.index,
                target: result.destination.index,
            })
        )
    }

    return (
        <div>
            <Card>
                <CardHeader
                    action={
                        <IconButton
                            aria-label="add layer"
                            onClick={() => setIsAddLayerActive(true)}
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
                        <DragDropContext onDragEnd={onDragEnd}>
                            {droppingEnabled && (
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <List
                                            disablePadding
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {layersState.ordered.map(
                                                (layer, i) => (
                                                    <Draggable
                                                        key={layer.id}
                                                        draggableId={layer.id}
                                                        index={i}
                                                    >
                                                        {(
                                                            provided,
                                                            snapshot
                                                        ) => (
                                                            <ListItem
                                                                ref={
                                                                    provided.innerRef
                                                                }
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={getItemStyle(
                                                                    snapshot.isDragging,
                                                                    provided
                                                                        .draggableProps
                                                                        .style
                                                                )}
                                                                key={layer.name}
                                                                secondaryAction={
                                                                    <Tooltip title="Layer">
                                                                        <IconButton
                                                                            edge="end"
                                                                            onClick={(
                                                                                event: React.MouseEvent<HTMLElement>
                                                                            ) => {
                                                                                setAnchorEl(
                                                                                    event.currentTarget
                                                                                )
                                                                                setActiveLayer(
                                                                                    layer
                                                                                )
                                                                            }}
                                                                            aria-haspopup="true"
                                                                        >
                                                                            <MoreVert
                                                                                sx={{
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                <ListItemIcon>
                                                                    <DragHandle />
                                                                </ListItemIcon>
                                                                <ListItemIcon>
                                                                    <Checkbox
                                                                        edge="start"
                                                                        checked={
                                                                            layersState
                                                                                .isActive[
                                                                                layer
                                                                                    .id
                                                                            ]!
                                                                        }
                                                                        onChange={() =>
                                                                            dispatch(
                                                                                toggleActive(
                                                                                    layer
                                                                                )
                                                                            )
                                                                        }
                                                                        tabIndex={
                                                                            -1
                                                                        }
                                                                        disableRipple
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={
                                                                        layer.name
                                                                    }
                                                                    primaryTypographyProps={{
                                                                        style: {
                                                                            whiteSpace:
                                                                                'normal',
                                                                            overflow:
                                                                                'hidden',
                                                                        },
                                                                    }}
                                                                />
                                                            </ListItem>
                                                        )}
                                                    </Draggable>
                                                )
                                            )}
                                        </List>
                                    )}
                                </Droppable>
                            )}
                        </DragDropContext>
                    </CardContent>
                </Collapse>
            </Card>
            {AddLayerDialog({
                open: isAddLayerActive,
                onClose: () => setIsAddLayerActive(false),
            })}
            {LayerMenu(
                activeLayer,
                activeLayer ? layersState.styles[activeLayer.id]! : null,
                anchorEl,
                handleCloseLayerMenu
            )}
        </div>
    )
}
