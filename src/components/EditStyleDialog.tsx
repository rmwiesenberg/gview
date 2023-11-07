import { FeaturesGeoLayer, GeoLayer } from '../common/GeoLayer'
import { rgbaToHex } from '@uiw/color-convert'
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
} from '@mui/material'
import React from 'react'
import { useAppDispatch } from '../app/hook'
import { setStyle } from '../features/layersSlice'
import {
    Color,
    FieldGetColor,
    GetColor,
    RawGetColor,
    Style,
} from '../common/Style'
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
    FieldProps<GetColor> & { prefix: React.ReactNode; layer: FeaturesGeoLayer }
> = ({ field, form: { setFieldValue }, layer }) => {
    // @ts-ignore
    const fieldName = field.value.field ?? ''
    const defaultValue = field.value.defaultValue

    return (
        <div>
            <InputLabel id="property">By property?</InputLabel>
            <Select
                id="property"
                label="By property?"
                fullWidth
                value={fieldName}
                onChange={(event) => {
                    const fieldName = event.target.value as string
                    setFieldValue(
                        field.name,
                        fieldName
                            ? new FieldGetColor(fieldName, defaultValue)
                            : new RawGetColor(defaultValue)
                    )
                }}
            >
                <MenuItem value={''} key="Unset">
                    Unset
                </MenuItem>
                {Object.keys(layer.hashable_props).map((fieldName) => (
                    <MenuItem value={fieldName} key={fieldName}>
                        Property: {fieldName}
                    </MenuItem>
                ))}
            </Select>
            <Typography>Default Value:</Typography>
            <Sketch
                color={rgbaToHex({
                    r: field.value.defaultValue[0],
                    g: field.value.defaultValue[1],
                    b: field.value.defaultValue[2],
                    a: field.value.defaultValue[3] ?? 1,
                })}
                disableAlpha={true}
                onChange={(inputColor) => {
                    const rgb = inputColor.rgb
                    const defaultValue: Color = [rgb.r, rgb.g, rgb.b]
                    setFieldValue(
                        field.name,
                        fieldName
                            ? new FieldGetColor(fieldName, defaultValue)
                            : new RawGetColor(defaultValue)
                    )
                }}
            />
        </div>
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
                                            layer={layer}
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
                                            layer={layer}
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
