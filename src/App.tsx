import DeckGL from '@deck.gl/react/typed'
import { ViewState } from './core/ViewState'
import { Box } from '@mui/material'
import React from 'react'
import { GeoLayer, TileGeoLayer } from './core/GeoLayer'
import { LayerList } from './components/LayerList'

const INITIAL_VIEW_STATE: ViewState = {
    longitude: -83.0,
    latitude: 42.33,
    zoom: 11,
    pitch: 30,
    maxPitch: 89.9,
}

const initialLayers: GeoLayer[] = [
    new TileGeoLayer({
        name: 'OpenStreetMap',
        active: true,
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        minZoom: 0,
        maxZoom: 19,
    }),
]

function App() {
    const [initialViewState, setInitialViewState] =
        React.useState(INITIAL_VIEW_STATE)
    const [layers, setLayers] = React.useState(initialLayers)
    const [hoverInfo, setHoverInfo] = React.useState<any>({})

    let activeLayers = []
    for (const layer of layers) {
        if (layer.active) {
            activeLayers.push(layer)
        }
    }

    console.log(
        `Using initial view state of ${JSON.stringify(initialViewState)}`
    )

    return (
        <div>
            <Box
                p={3}
                sx={{ minWidth: 150, maxWidth: 300 }}
                style={{ position: 'relative', zIndex: '1' }}
            >
                {LayerList(layers, setLayers, setInitialViewState)}
            </Box>
            <DeckGL
                initialViewState={initialViewState}
                viewState={false}
                layers={activeLayers
                    .map((l) => l.makeLayer(setHoverInfo))
                    .reverse()}
                controller={true}
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
