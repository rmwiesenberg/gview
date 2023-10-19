import { TileLayer } from '@deck.gl/geo-layers/typed'
import { BitmapLayer } from '@deck.gl/layers/typed'

export interface GeoLayer {
    name: string
    active: boolean

    makeLayer: () => TileLayer
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
