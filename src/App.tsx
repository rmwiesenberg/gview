import DeckGL from '@deck.gl/react/typed'
import { ViewState } from './core/ViewState'
import { Box } from '@mui/material'
import React from 'react'
import { GeoLayer, TileGeoLayer } from './core/GeoLayer'
import { LayerList } from './components/LayerList'

const initialViewState: ViewState = {
    longitude: -83.0,
    latitude: 42.33,
    zoom: 11,
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
    const [layers, setLayers] = React.useState(initialLayers)

    let activeLayers = []
    for (const layer of layers) {
        if (layer.active) {
            activeLayers.push(layer)
        }
    }

    return (
        <div>
            <Box
                p={3}
                sx={{ minWidth: 150, maxWidth: 300 }}
                style={{ position: 'relative', zIndex: '1' }}
            >
                {LayerList(layers, setLayers)}
            </Box>
            <DeckGL
                initialViewState={initialViewState}
                layers={activeLayers.map((l) => l.makeLayer())}
                controller={true}
            />
        </div>
    )
}

export default App
