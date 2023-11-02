import { GeoLayer } from '../common/GeoLayer'
import { rgbaToHex } from '@uiw/color-convert'
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    Grid,
    Slider,
    Typography,
} from '@mui/material'
import React from 'react'
import { useAppDispatch } from '../app/hook'
import { setStyle } from '../features/layersSlice'
import { GetColor, RawGetColor, Style } from '../common/Style'
import Sketch from '@uiw/react-color-sketch'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'

type CloseFormCallback = () => void

export interface EditStyleProps {
    layer: GeoLayer | null
    initialStyle: Style | null
    open: boolean
    onClose: CloseFormCallback
}

const spacer = () => <Box sx={{ height: 16 }}></Box>

const SetColorField: React.FC<
    FieldProps<GetColor> & { prefix: React.ReactNode }
> = ({ field, form: { setFieldValue } }) => {
    if (typeof field.value.getColor == 'function') return <div></div>

    const color = field.value.getColor

    return (
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
                setFieldValue(
                    field.name,
                    new RawGetColor([rgb.r, rgb.g, rgb.b])
                )
            }}
        />
    )
}

const StyleSchema = Yup.object().shape({
    opacity: Yup.number().min(0).max(1),
})

export const EditStyleDialog = (props: EditStyleProps) => {
    const { layer, initialStyle, open, onClose } = props

    const dispatch = useAppDispatch()

    if (layer == null || initialStyle == null) return <div></div>

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Edit Layer Style</DialogTitle>
            <Container sx={{ width: 480 }}>
                <Formik
                    initialValues={initialStyle}
                    validationSchema={StyleSchema}
                    onSubmit={(style) => {
                        onClose()
                        console.log(`Updating style: ${JSON.stringify(style)}`)
                        dispatch(setStyle({ layer, style }))
                    }}
                >
                    {({ handleChange, values }) => (
                        <Form>
                            <Grid container spacing={2}>
                                {values.getStrokeColor && (
                                    <Grid item xs={6}>
                                        <Typography>
                                            Stroke/Outline Color
                                        </Typography>
                                        <Field
                                            id="getStrokeColor"
                                            name="getStrokeColor"
                                            component={SetColorField}
                                        />
                                    </Grid>
                                )}
                                {values.getFillColor && (
                                    <Grid item xs={6}>
                                        <Typography>Fill Color</Typography>
                                        <Field
                                            id="getFillColor"
                                            name="getFillColor"
                                            component={SetColorField}
                                        />
                                    </Grid>
                                )}
                            </Grid>

                            {spacer()}

                            <Typography>Opacity</Typography>
                            <Slider
                                id="opacity"
                                name="opacity"
                                min={0}
                                step={1e-2}
                                max={1}
                                defaultValue={values.opacity}
                                valueLabelDisplay="auto"
                                onChange={handleChange}
                            />
                            {spacer()}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth={true}
                            >
                                Apply
                            </Button>
                            {spacer()}
                        </Form>
                    )}
                </Formik>
            </Container>
        </Dialog>
    )
}
