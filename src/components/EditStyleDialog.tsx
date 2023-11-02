import { GeoLayer } from '../common/GeoLayer'
import { rgbaToHex } from '@uiw/color-convert'
import { Box, Button, Container, Dialog, DialogTitle } from '@mui/material'
import { FormContainer, SliderElement } from 'react-hook-form-mui'
import React from 'react'
import { useAppDispatch } from '../app/hook'
import { setStyle } from '../features/layersSlice'
import { GetColor, RawGetColor, Style } from '../common/Style'
import Sketch from '@uiw/react-color-sketch'

type CloseFormCallback = () => void

export interface EditStyleProps {
    layer: GeoLayer | null
    style: Style | null
    open: boolean
    onClose: CloseFormCallback
}

const spacer = () => <Box sx={{ height: 16 }}></Box>

type ColorCallback = (color: GetColor) => void

const SetColorField = (styleColor: GetColor, onChange: ColorCallback) => {
    if (typeof styleColor.getColor == 'function') return <div></div>

    const color = styleColor.getColor

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Sketch
                color={rgbaToHex({
                    r: color[0],
                    g: color[1],
                    b: color[2],
                    a: color[3] ?? 1,
                })}
                disableAlpha={true}
                onChange={(color) => {
                    const rgb = color.rgb
                    onChange(new RawGetColor([rgb.r, rgb.g, rgb.b]))
                }}
            />
        </div>
    )
}

export const EditStyleDialog = (props: EditStyleProps) => {
    const { layer, style, open, onClose } = props
    const [getFillColor, setGetFillColor] = React.useState(style?.getFillColor)

    const dispatch = useAppDispatch()

    if (layer == null) return <div></div>

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Edit Layer Style</DialogTitle>
            <Container sx={{ minWidth: 480 }}>
                <FormContainer
                    defaultValues={{
                        ...style,
                        opacity: style!.opacity * 100,
                    }}
                    onSuccess={(style: Style) => {
                        onClose()
                        const newStyle = {
                            ...style,
                            opacity: style.opacity / 100,
                            getFillColor: getFillColor,
                        }
                        console.log(`Updating style: ${newStyle}`)
                        dispatch(setStyle([layer, newStyle]))
                    }}
                >
                    {style?.getFillColor &&
                        SetColorField(style.getFillColor, (c) =>
                            setGetFillColor(c)
                        )}
                    {spacer()}
                    <SliderElement
                        label="Opacity %"
                        name="opacity"
                        required
                    ></SliderElement>
                    {spacer()}
                    <Button type="submit" variant="contained" fullWidth={true}>
                        Apply
                    </Button>
                    {spacer()}
                </FormContainer>
            </Container>
        </Dialog>
    )
}
