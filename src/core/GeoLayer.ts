import { TileLayer } from '@deck.gl/geo-layers/typed'
import { GeoJsonLayer } from '@deck.gl/layers/typed'
import { BitmapLayer } from '@deck.gl/layers/typed'
import type { Feature } from 'geojson'
import { load } from '@loaders.gl/core'
import { _GeoJSONLoader } from '@loaders.gl/json'
import { GeoPackageLoader } from '@loaders.gl/geopackage'

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

    static async fromFile(file: File): Promise<FeaturesGeoLayer | null> {
        const gpkgData: any = await load(
            file,
            [_GeoJSONLoader, GeoPackageLoader],
            {
                geopackage: {
                    sqlJsCDN:
                        'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/',
                },
                gis: {
                    format: 'geojson',
                    reproject: true,
                    _targetCrs: 'WGS84',
                },
            }
        )
        console.log(gpkgData)

        if (gpkgData == null) return null

        return new FeaturesGeoLayer({
            name: file.name,
            active: true,
            features: gpkgData.features,
        })
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
