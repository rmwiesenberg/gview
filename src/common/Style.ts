import { Feature } from 'geojson'
import { Dictionary } from '@reduxjs/toolkit'
import { FeaturesGeoLayer } from './GeoLayer'

type GetterType = 'field' | 'raw'
type GenFunc<T> = (feature: Feature) => T
class FieldGet<T> {
    type: GetterType = 'field'
    field: string
    defaultValue: T
    genFunc: GenFunc<T>
    valueLookup: Dictionary<T> = {}

    constructor(field: string, defaultValue: T, genFunc: GenFunc<T>) {
        this.field = field
        this.genFunc = genFunc
        this.defaultValue = defaultValue
    }

    get = (feature: Feature): T => {
        const properties = feature.properties
        if (!properties) return this.defaultValue

        const fieldValue = properties[this.field]
        if (!fieldValue) return this.defaultValue

        const storedValue = this.valueLookup[fieldValue]
        if (storedValue) return storedValue

        const newValue = this.genFunc(feature)
        this.valueLookup[fieldValue] = newValue
        return newValue
    }
}

export type Color = [number, number, number, number] | [number, number, number]
const randomColor = (): Color => {
    const randomVal = () => Math.random() * 255
    let rgb: Color = [randomVal(), randomVal(), randomVal()]
    if (rgb[0] + rgb[1] + rgb[2] > 255 * 2) {
        rgb = [rgb[0] / 2, rgb[1] / 2, rgb[2] / 2]
    }
    return rgb
}

type ColorFunction = (feature: Feature) => Color
export interface GetColor {
    type: GetterType
    getColor: ColorFunction | Color
    defaultValue: Color
}
export class RawGetColor implements GetColor {
    type: GetterType = 'raw'
    getColor: Color
    defaultValue: Color

    constructor(color: Color) {
        this.defaultValue = color
        this.getColor = color
    }
}
export class FieldGetColor extends FieldGet<Color> implements GetColor {
    type: GetterType = 'field'
    getColor = this.get

    constructor(field: string, defaultValue: Color) {
        super(field, defaultValue, (feature: Feature) => {
            // The caller should have already check the null-ness of this field.
            let value = feature.properties![this.field]!

            let isString = typeof value === 'string' || value instanceof String
            if (
                isString &&
                value.startsWith('#') &&
                [4, 5, 7, 9].includes(value.length)
            ) {
                let step = [4, 5].includes(value.length) ? 1 : 2
                let color = []
                for (let i = 1; i < value.length; i += step) {
                    let slice = value.slice(i, i + step).toLowerCase()
                    if (step === 1) slice = slice + slice
                    color.push(parseInt(slice, 16))
                }
                if (!color.includes(NaN)) return color as Color
            }
            return randomColor()
        })
    }
}

type NumberFunction = (feature: Feature) => number
export interface GetNumber {
    type: GetterType
    getNumber: NumberFunction | number
}
export class RawGetNumber implements GetNumber {
    type: GetterType = 'raw'
    getNumber: number

    constructor(number: number) {
        this.getNumber = number
    }
}
export class FieldGetNumber extends FieldGet<number> implements GetNumber {
    type: GetterType = 'field'
    getNumber = this.get

    constructor(field: string) {
        super(field, 1, () => 1)
    }
}

type WidthUnits = 'meters' | 'common' | 'pixels'

export interface Style {
    opacity: number
    getFillColor?: GetColor
    getStrokeColor?: GetColor

    getStrokeWidth?: GetNumber
    strokeWidthScale?: number
    strokeWidthUnits?: WidthUnits

    getPointRadius?: GetNumber
    pointRadiusScale?: number
    pointRadiusUnits?: WidthUnits

    full3D?: boolean
}

export const getDefaultStyle = (): Style => {
    return { opacity: 0.8 }
}
export const getNewFeatureStyle = (layer: FeaturesGeoLayer): Style => {
    return {
        ...getDefaultStyle(),

        getFillColor:
            'fill' in layer.hashable_props
                ? new FieldGetColor('fill', randomColor())
                : new RawGetColor(randomColor()),
        getStrokeColor:
            'stroke' in layer.hashable_props
                ? new FieldGetColor('stroke', randomColor())
                : new RawGetColor(randomColor()),

        getStrokeWidth: new RawGetNumber(1),
        strokeWidthScale: 1,
        strokeWidthUnits: 'pixels',

        getPointRadius: new RawGetNumber(1),
        pointRadiusScale: 1,
        pointRadiusUnits: 'pixels',

        full3D: true,
    }
}
