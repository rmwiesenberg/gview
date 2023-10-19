import { TileLayer } from '@deck.gl/geo-layers/typed'
import { GeoJsonLayer } from '@deck.gl/layers/typed'
import { BitmapLayer } from '@deck.gl/layers/typed'
import type { Feature } from 'geojson'

export interface GeoLayer {
    name: string
    active: boolean

    makeLayer: () => TileLayer | GeoJsonLayer
}

export class TileGeoLayer implements GeoLayer {
    name: string
    active: boolean
    url: string
    minZoom: number
    maxZoom: number

    constructor({
        name,
        active,
        url,
        minZoom,
        maxZoom,
    }: {
        name: string
        active: boolean
        url: string
        minZoom: number
        maxZoom: number
    }) {
        this.name = name
        this.active = active
        this.url = url
        this.minZoom = minZoom
        this.maxZoom = maxZoom
    }

    makeLayer(): TileLayer {
        return new TileLayer({
            data: this.url,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom,

            renderSubLayers: (props) => {
                const {
                    // @ts-ignore
                    bbox: { west, south, east, north },
                } = props.tile

                return new BitmapLayer(props, {
                    data: undefined,
                    image: props.data,
                    bounds: [west, south, east, north],
                })
            },
        })
    }
}

export class FeaturesGeoLayer implements GeoLayer {
    name: string
    active: boolean
    features: Feature[]

    constructor({
        name,
        active,
        features,
    }: {
        name: string
        active: boolean
        features: Feature[]
    }) {
        this.name = name
        this.active = active
        this.features = features
    }

    makeLayer(): GeoJsonLayer {
        return new GeoJsonLayer({
            data: this.features,
            pickable: true,
            stroked: false,
            filled: true,
            extruded: true,
            pointType: 'circle',
            lineWidthScale: 20,
            lineWidthMinPixels: 2,
            getPointRadius: 100,
            getLineWidth: 1,
            getElevation: 30,
        })
    }
}
