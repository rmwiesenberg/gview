import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice, Dictionary } from '@reduxjs/toolkit'
import { GeoLayer } from '../common/GeoLayer'
import { getDefaultStyle, getNewFeatureStyle, Style } from '../common/Style'

export interface LayersState {
    layers: Dictionary<GeoLayer>
    ordered: GeoLayer[]
    isActive: Dictionary<boolean>
    styles: Dictionary<Style>
}

export const initialState: LayersState = {
    layers: {},
    ordered: [],
    isActive: {},
    styles: {},
}

export const layersSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        addLayer: (state, action: PayloadAction<GeoLayer>) => {
            const newLayer = action.payload

            state.layers[newLayer.id] = newLayer
            state.ordered = [newLayer, ...state.ordered]
            state.isActive[newLayer.id] = true
            state.styles[newLayer.id] =
                newLayer.type === 'feature'
                    ? getNewFeatureStyle()
                    : getDefaultStyle()

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
            delete state.styles[removedLayer.id]

            return state
        },
        toggleActive: (state, action: PayloadAction<GeoLayer>) => {
            state.isActive[action.payload.id] =
                !state.isActive[action.payload.id]
            return state
        },
        setStyle: (state, action: PayloadAction<[GeoLayer, Style]>) => {
            const [layer, style] = action.payload

            state.styles[layer.id] = style
            return
        },
    },
})

export const { addLayer, removeLayer, toggleActive, setStyle } =
    layersSlice.actions

export default layersSlice.reducer
