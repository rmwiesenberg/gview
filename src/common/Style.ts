import { Feature } from 'geojson'
import { Dictionary } from '@reduxjs/toolkit'

export interface Style {
    opacity: number
}

type GetterType = 'field' | 'raw'
class FieldGet<T> {
    type: GetterType = 'field'
    field: string
    defaultValue: T
    genFunc: () => T
    valueLookup: Dictionary<T> = {}

    constructor(field: string, defaultValue: T, genFunc: () => T) {
        this.field = field
        this.genFunc = genFunc
        this.defaultValue = defaultValue
    }

    get = (feature: Feature): T => {
        const properties = feature.properties
        if (properties == null) return this.defaultValue

        const fieldValue = properties[this.field]
        if (fieldValue == null) return this.defaultValue

        const storedValue = this.valueLookup[fieldValue]
        if (storedValue) return storedValue

        const newValue = this.genFunc()
        this.valueLookup[fieldValue] = newValue
        return newValue
    }
}

type Color = [number, number, number] | [number, number, number, number]
const randomColor = (): Color => {
    return [255, 255, 255]
}

type ColorFunction = (feature: Feature) => Color
interface GetColor {
    type: GetterType
    getColor: ColorFunction | Color
}
export class RawGetColor implements GetColor {
    type: GetterType = 'raw'
    getColor: Color

    constructor(color: Color) {
        this.getColor = color
    }
}
export class FieldGetColor extends FieldGet<Color> implements GetColor {
    type: GetterType = 'field'
    getColor = this.get

    constructor(field: string) {
        super(field, randomColor(), () => randomColor())
    }
}

type NumberFunction = (feature: Feature) => number
interface GetNumber {
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

export interface FeaturesStyle extends Style {
    getFillColor: GetColor
    getStrokeColor: GetColor
    getStrokeWidth: GetNumber
    strokeWidthUnits: WidthUnits
    strokeWidthScale: number
}

export const DEFAULT_STYLE: Style = { opacity: 0.8 }
export const getNewFeatureStyle = (): FeaturesStyle => {
    return {
        ...DEFAULT_STYLE,
        getFillColor: new RawGetColor(randomColor()),
        getStrokeColor: new RawGetColor(randomColor()),
        getStrokeWidth: new RawGetNumber(0.8),
        strokeWidthUnits: 'pixels',
        strokeWidthScale: 1,
    }
}
