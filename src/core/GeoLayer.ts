import { TileLayer } from '@deck.gl/geo-layers/typed'
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers/typed'
import type { Feature } from 'geojson'
import { load } from '@loaders.gl/core'
import { _GeoJSONLoader } from '@loaders.gl/json'
import { GeoPackageLoader } from '@loaders.gl/geopackage'
import bbox from '@turf/bbox'
import { featureCollection } from '@turf/helpers'

type SetHoverInfoCallback = (info: any) => void

export interface GeoLayer {
    name: string
    active: boolean
    bounds: [number[], number[]] | null

    makeLayer: (setHoverInfo: SetHoverInfoCallback) => TileLayer | GeoJsonLayer
}

export class TileGeoLayer implements GeoLayer {
    name: string
    active: boolean
    url: string
    minZoom: number
    maxZoom: number
    bounds = null
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
    bounds: [number[], number[]] | null = null

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

        const layerBBox = bbox(featureCollection(this.features))
        this.bounds = [
            [layerBBox[0], layerBBox[1]],
            [layerBBox[2], layerBBox[3]],
        ]

        console.log(`New layer ${this.name} with bounds ${this.bounds}`)
    }

    makeLayer(setHoverInfo: SetHoverInfoCallback): GeoJsonLayer {
        return new GeoJsonLayer({
            data: this.features,
            pickable: true,
            stroked: false,
            filled: true,
            pointType: 'circle',
            lineWidthMinPixels: 1,
            pointRadiusMinPixels: 1,
            opacity: 0.8,
            getPosition: (d: any) => d.position,
            onHover: (info) => {
                console.log(info)
                setHoverInfo(info)
            },
        })
    }
}

export const geoLayerFromFile = async (
    file: File
): Promise<GeoLayer[] | null> => {
    const options = {
        geopackage: {
            sqlJsCDN: 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/',
        },
        gis: {
            format: 'geojson',
            reproject: true,
            _targetCrs: 'WGS84',
        },
    }

    let ext = file.name.toLowerCase().split('.').pop()
    console.log(`Loading ${ext} file`)

    let layers: GeoLayer[] | null = null
    switch (ext) {
        case 'geojson':
            const geojson = await load(file, _GeoJSONLoader, options)
            layers = [
                new FeaturesGeoLayer({
                    name: file.name,
                    active: true,
                    features: geojson.features,
                }),
            ]
            break
        case 'gpkg':
            const geopackage: any = await load(file, GeoPackageLoader, options)
            layers = []
            for (let layerName in geopackage) {
                layers.push(
                    new FeaturesGeoLayer({
                        name: `${file.name}-${layerName}`,
                        active: true,
                        features: geopackage[layerName],
                    })
                )
            }
            break
    }
    return layers
}
