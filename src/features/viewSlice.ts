import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { Bounds, MapDimensions, MapInfo } from '../common/mapInfo'
import { GeoLayer } from '../common/GeoLayer'
import { FlyToInterpolator } from '@deck.gl/core/typed'

export interface ViewManagement {
    lastSet: MapInfo
}

export const initialState: ViewManagement = {
    lastSet: {
        longitude: 0,
        latitude: 0,
        zoom: 1,
        pitch: 30,
        maxPitch: 89.9,
        maxZoom: 21,
    },
}

const WORLD_DIM: MapDimensions = { pxHeight: 256, pxWidth: 256 }

// Remixed from https://stackoverflow.com/a/13274361
function getBoundsZoomLevel(bounds: Bounds, mapDim: MapDimensions) {
    const latRad = (lat: number) => {
        const sin = Math.sin((lat * Math.PI) / 180)
        const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
    }

    const zoom = (mapPx: number, worldPx: number, fraction: number) => {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
    }

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI

    const lngDiff = ne.lng - sw.lng
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

    const latZoom = zoom(mapDim.pxHeight, WORLD_DIM.pxHeight, latFraction)
    const lngZoom = zoom(mapDim.pxWidth, WORLD_DIM.pxWidth, lngFraction)

    return Math.min(latZoom, lngZoom, initialState.lastSet.maxZoom!)
}

export const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {
        setNewState: (state, action: PayloadAction<MapInfo>) => {
            return { ...state, lastSet: action.payload }
        },
        focusLayer: (state, action: PayloadAction<GeoLayer>) => {
            const layer = action.payload

            console.log(`Focusing on ${layer.name}`)
            const bounds = layer.bounds
            if (bounds == null) return state

            const center = bounds.getCenter()
            const zoom = getBoundsZoomLevel(bounds, WORLD_DIM)

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
                        zoom: zoom,
                        longitude: center.lng + randomOffset(),
                        latitude: center.lat + randomOffset(),
                        transitionDuration: 1000,
                        transitionInterpolator: new FlyToInterpolator(),
                    },
                },
            }
        },
    },
})

export const { setNewState, focusLayer } = viewSlice.actions

export default viewSlice.reducer
