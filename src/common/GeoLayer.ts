import { TileLayer } from '@deck.gl/geo-layers/typed'
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers/typed'
import type { Feature } from 'geojson'
import { load } from '@loaders.gl/core'
import { _GeoJSONLoader } from '@loaders.gl/json'
import { GeoPackageLoader } from '@loaders.gl/geopackage'
import bbox from '@turf/bbox'
import { featureCollection } from '@turf/helpers'
import { v4 as uuidv4 } from 'uuid'
import { Bounds } from './mapInfo'

type SetHoverInfoCallback = (info: any) => void

export interface GeoLayer {
    id: string
    name: string
    bounds: Bounds | null

    makeLayer: (setHoverInfo: SetHoverInfoCallback) => TileLayer | GeoJsonLayer
}

export class TileGeoLayer implements GeoLayer {
    id: string
    name: string
    url: string
    minZoom: number
    maxZoom: number
    bounds = null
    constructor({
        name,
        url,
        minZoom,
        maxZoom,
    }: {
        name: string
        url: string
        minZoom: number
        maxZoom: number
    }) {
        this.id = uuidv4()
        this.name = name
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
    id: string
    name: string
    features: Feature[]
    bounds: Bounds | null = null

    constructor({ name, features }: { name: string; features: Feature[] }) {
        this.id = uuidv4()
        this.name = name
        this.features = features

        const layerBBox = bbox(featureCollection(this.features))
        this.bounds = new Bounds(
            { lng: layerBBox[0], lat: layerBBox[1] },
            { lng: layerBBox[2], lat: layerBBox[3] }
        )

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

export async function* geoLayerFromFile(file: File): AsyncIterable<GeoLayer> {
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

    switch (ext) {
        case 'geojson':
            const geojson = await load(file, _GeoJSONLoader, options)
            yield new FeaturesGeoLayer({
                name: file.name,
                features: geojson.features,
            })
            break
        case 'gpkg':
            const geopackage: any = await load(file, GeoPackageLoader, options)
            for (let layerName in geopackage) {
                yield new FeaturesGeoLayer({
                    name: `${file.name}-${layerName}`,
                    features: geopackage[layerName],
                })
            }
            break
    }
}
