import { Feature } from 'geojson'
import { Dictionary } from '@reduxjs/toolkit'

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
        if (!properties) return this.defaultValue

        const fieldValue = properties[this.field]
        if (!fieldValue) return this.defaultValue

        const storedValue = this.valueLookup[fieldValue]
        if (storedValue) return storedValue

        const newValue = this.genFunc()
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
        super(field, defaultValue, () => randomColor())
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
    strokeWidthUnits?: WidthUnits
    strokeWidthScale?: number
}

export const getDefaultStyle = (): Style => {
    return { opacity: 0.8 }
}
export const getNewFeatureStyle = (): Style => {
    return {
        ...getDefaultStyle(),
        getFillColor: new RawGetColor(randomColor()),
        getStrokeColor: new RawGetColor(randomColor()),
        getStrokeWidth: new RawGetNumber(1),
        strokeWidthUnits: 'pixels',
        strokeWidthScale: 1,
    }
}
