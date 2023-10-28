import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ViewState } from '../common/ViewState'
import { GeoLayer } from '../common/GeoLayer'
import { FlyToInterpolator } from '@deck.gl/core/typed'

export interface ViewManagement {
    lastSet: ViewState
}

export const initialState: ViewManagement = {
    lastSet: {
        longitude: -83.0,
        latitude: 42.33,
        zoom: 11,
        pitch: 30,
        maxPitch: 89.9,
    },
}

export const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {
        focusLayer: (state, action: PayloadAction<GeoLayer>) => {
            const layer = action.payload

            console.log(`Focusing on ${layer}`)
            const bounds = layer.bounds
            if (bounds == null) return state

            const lngZoom = 120 / Math.abs(bounds[0][0] - bounds[1][0])
            const latZoom = 60 / Math.abs(bounds[0][1] - bounds[1][1])

            const lng = (bounds[0][0] + bounds[1][0]) / 2
            const lat = (bounds[0][1] + bounds[1][1]) / 2

            const randomOffset = () => {
                return (Math.random() - 0.5) * 1e-6
            }

            // Add small, random number to lng/lat so that zoom always works.
            return {
                ...state,
                lastSet: {
                    ...state.lastSet,
                    ...{
                        pitch: 0,
                        zoom: Math.min(lngZoom, latZoom),
                        longitude: lng + randomOffset(),
                        latitude: lat + randomOffset(),
                        transitionDuration: 1000,
                        transitionInterpolator: new FlyToInterpolator(),
                    },
                },
            }
        },
    },
})

export const { focusLayer } = viewSlice.actions

export default viewSlice.reducer
