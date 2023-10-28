import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice, Dictionary } from '@reduxjs/toolkit'
import { GeoLayer } from '../common/GeoLayer'

export interface LayersState {
    layers: Dictionary<GeoLayer>
    ordered: GeoLayer[]
    isActive: Dictionary<boolean>
}

export const initialState: LayersState = {
    layers: {},
    ordered: [],
    isActive: {},
}

export const layersSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        addLayers: (state, action: PayloadAction<GeoLayer[]>) => {
            for (let newLayer of action.payload) {
                state.layers[newLayer.id] = newLayer
                state.ordered.push(newLayer)
                state.isActive[newLayer.id] = true
            }

            return state
        },
        removeLayer: (state, action: PayloadAction<GeoLayer>) => {
            const removedLayer = action.payload
            const i = state.ordered.indexOf(removedLayer)

            delete state.layers[removedLayer.id]
            state.ordered = [
                ...state.ordered.slice(0, i),
                ...state.ordered.slice(i + 1),
            ]
            delete state.isActive[removedLayer.id]

            return state
        },
        toggleActive: (state, action: PayloadAction<GeoLayer>) => {
            state.isActive[action.payload.id] =
                !state.isActive[action.payload.id]
            return state
        },
    },
})

export const { addLayers, removeLayer, toggleActive } = layersSlice.actions

export default layersSlice.reducer
