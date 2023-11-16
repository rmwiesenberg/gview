import DeckGL from '@deck.gl/react/typed'
import {
    Box,
    Link,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material'
import React from 'react'
import { LayerList } from './components/LayerList'
import { useAppDispatch, useAppSelector } from './app/hook'
import { Map as MapIcon, Public as PublicIcon } from '@mui/icons-material'
import { _GlobeView, MapView } from '@deck.gl/core/typed'
import { useSearchParams } from 'react-router-dom'
import { addLayerUniqueSource } from './features/layersSlice'
import { geoLayerFromFile, TileGeoLayer } from './common/GeoLayer'

type ViewType = 'map' | 'globe'

function App() {
    const [queryParams, setQueryParams] = useSearchParams()
    const [hoverInfo, setHoverInfo] = React.useState<any>({})
    const [viewType, setViewType] = React.useState<ViewType>('map')

    const layersState = useAppSelector((state) => state.layers)
    const viewState = useAppSelector((state) => state.view)
    const dispatch = useAppDispatch()

    const loadParams = async () => {
        for (const xyz of queryParams.getAll('xyz')) {
            dispatch(
                addLayerUniqueSource(
                    new TileGeoLayer({
                        name: xyz,
                        url: `https://${xyz}`,
                        minZoom: 0,
                        maxZoom: 19,
                    })
                )
            )
        }
        for (const file of queryParams.getAll('file')) {
            for await (let newLayer of geoLayerFromFile(`https://${file}`)) {
                dispatch(addLayerUniqueSource(newLayer))
            }
        }
        setQueryParams()
    }
    if (queryParams.size) loadParams()

    let activeLayers = []
    for (const layer of layersState.ordered) {
        if (layersState.isActive[layer.id]) activeLayers.push(layer)
    }

    const mapView = new MapView({ id: 'map', controller: true })
    const globeView = new _GlobeView({ id: 'globe', controller: true })

    return (
        <div>
            <Box
                p={3}
                sx={{ minWidth: 120, width: 0.33 }}
                style={{ position: 'relative', zIndex: '1' }}
            >
                {LayerList()}
            </Box>
            <Box
                p={3}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    zIndex: '1',
                }}
            >
                <ToggleButtonGroup
                    value={viewType}
                    exclusive
                    onChange={(_, newViewType) => setViewType(newViewType)}
                    aria-label="text alignment"
                >
                    <ToggleButton value="map" aria-label="map">
                        <MapIcon />
                    </ToggleButton>
                    <ToggleButton value="world" aria-label="world">
                        <PublicIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box mt={3} zIndex="2" position="absolute" bottom="0px">
                <Paper>
                    &copy; Ryan Wiesenberg&nbsp;|&nbsp;
                    <Link
                        href="https://github.com/rmwiesenberg/gview"
                        target="_blank"
                        rel="noopener"
                    >
                        GitHub and License
                    </Link>
                    &nbsp;
                </Paper>
            </Box>
            <DeckGL
                initialViewState={viewState.lastSet}
                viewState={false}
                views={viewType === 'map' ? mapView : globeView}
                layers={activeLayers
                    .map((l) =>
                        l.makeLayer(layersState.styles[l.id]!, setHoverInfo)
                    )
                    .reverse()}
            />
            {hoverInfo.object && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 1,
                        pointerEvents: 'none',
                        left: hoverInfo.x,
                        top: hoverInfo.y,
                    }}
                >
                    <pre>
                        {JSON.stringify(hoverInfo.object.properties, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default App
