import DeckGL from '@deck.gl/react/typed'
import { Box, Link, Paper } from '@mui/material'
import React from 'react'
import { LayerList } from './components/LayerList'
import { useAppSelector } from './app/hook'

function App() {
    const [hoverInfo, setHoverInfo] = React.useState<any>({})

    const layersState = useAppSelector((state) => state.layers)
    const viewState = useAppSelector((state) => state.view)

    let activeLayers = []
    for (const layer of layersState.ordered) {
        if (layersState.isActive[layer.id]) activeLayers.push(layer)
    }

    return (
        <div>
            <Box
                p={3}
                sx={{ minWidth: 150, maxWidth: 300 }}
                style={{ position: 'relative', zIndex: '1' }}
            >
                {LayerList()}
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
