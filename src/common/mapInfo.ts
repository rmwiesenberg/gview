import {TransitionInterpolator} from '@deck.gl/core/typed'

// Create a type for ViewStates because I can't find one in deck.gl and I like types.
export interface MapInfo {
    longitude?: number
    latitude?: number
    zoom?: number
    pitch?: number
    bearing?: number
    minZoom?: number
    maxZoom?: number
    minPitch?: number
    maxPitch?: number
    transitionDuration?: number
    transitionInterpolator?: TransitionInterpolator
}

export interface Point {
    lng: number
    lat: number
}

export class Bounds {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number

    constructor(pt1: Point, pt2: Point) {
        if (pt1.lng < pt2.lng) {
            this.minLng = pt1.lng
            this.maxLng = pt2.lng
        } else {
            this.minLng = pt2.lng
            this.maxLng = pt1.lng
        }

        if (pt1.lat < pt2.lat) {
            this.minLat = pt1.lat
            this.maxLat = pt2.lat
        } else {
            this.minLat = pt2.lat
            this.maxLat = pt1.lat
        }
    }

    getSouthWest = (): Point => {
        return { lng: this.minLng, lat: this.minLat }
    }
    getNorthEast = (): Point => {
        return { lng: this.maxLng, lat: this.maxLat }
    }
    getCenter = (): Point => {
        return {
            lng: (this.minLng + this.maxLng) / 2,
            lat: (this.minLat + this.maxLat) / 2,
        }
    }
}

export interface MapDimensions {
    pxHeight: number
    pxWidth: number
}
