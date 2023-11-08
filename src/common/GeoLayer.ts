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
import { Style } from './Style'
import { Dictionary } from '@reduxjs/toolkit'

type SetHoverInfoCallback = (info: any) => void
type LayerType = 'base' | 'feature'

export abstract class GeoLayer {
    id: string
    type: LayerType = 'base'
    name: string
    bounds: Bounds | null = null

    protected constructor(name: string) {
        this.id = uuidv4()
        this.name = name
    }

    makeLayer(
        style: Style,
        setHoverInfo: SetHoverInfoCallback
    ): TileLayer | GeoJsonLayer {
        throw Error()
    }
}

export class TileGeoLayer extends GeoLayer {
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
        super(name)
        this.url = url
        this.minZoom = minZoom
        this.maxZoom = maxZoom
    }

    makeLayer(style: Style): TileLayer {
        return new TileLayer({
            data: this.url,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom,
            opacity: style.opacity,

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

export class FeaturesGeoLayer extends GeoLayer {
    type: LayerType = 'feature'
    features: Feature[]
    hashable_props: Dictionary<Set<any>> = {}
    bounds: Bounds | null = null

    constructor({ name, features }: { name: string; features: Feature[] }) {
        super(name)

        this.features = features

        for (const feature of this.features) {
            for (const key in feature.properties) {
                const value = feature.properties[key]
                if (!this.hashable_props[key])
                    this.hashable_props[key] = new Set()
                if (!value) continue
                this.hashable_props[key]!.add(value)
            }
        }

        const layerBBox = bbox(featureCollection(this.features))
        this.bounds = new Bounds(
            { lng: layerBBox[0], lat: layerBBox[1] },
            { lng: layerBBox[2], lat: layerBBox[3] }
        )

        console.log(
            `New layer ${this.name} with
            bounds ${JSON.stringify(this.bounds)} and 
            props ${Object.keys(this.hashable_props)}`
        )
    }

    makeLayer(style: Style, setHoverInfo: SetHoverInfoCallback): GeoJsonLayer {
        const inferredStyle = {
            opacity: style.opacity,
            getFillColor: style.getFillColor?.getColor,
            getLineColor: style.getStrokeColor?.getColor,

            getLineWidth: style.getStrokeWidth?.getNumber,
            lineWidthScale: style.strokeWidthScale,
            lineWidthUnits: style.strokeWidthUnits,

            getPointRadius: style.getPointRadius?.getNumber,
            pointRadiusScale: style.pointRadiusScale,
            getRadiusUnits: style.pointRadiusUnits,

            updateTriggers: {
                getFillColor: style.getFillColor,
                getLineColor: style.getStrokeColor,

                getLineWidth: style.getStrokeWidth,
                lineWidthScale: style.strokeWidthScale,
                lineWidthUnits: style.strokeWidthUnits,

                getPointRadius: style.getPointRadius,
                pointRadiusScale: style.strokeWidthUnits,
                getRadiusUnits: style.pointRadiusUnits,
            },
        }

        return new GeoJsonLayer({
            data: this.features,
            pickable: true,
            stroked: true,
            filled: true,
            pointType: 'circle',
            lineWidthMinPixels: 1,
            pointRadiusMinPixels: 1,
            ...inferredStyle,
            getPosition: (d: any) => d.position,
            onHover: (info) => setHoverInfo(info),
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