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
    TextField,
    Typography,
} from '@mui/material'
import React from 'react'
import { useAppDispatch } from '../app/hook'
import { setStyle } from '../features/layersSlice'
import {
    Color,
    FieldGetColor,
    GetColor,
    GetNumber,
    RawGetColor,
    RawGetNumber,
    Style,
} from '../common/Style'
import Sketch from '@uiw/react-color-sketch'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { CheckboxWithLabel, TextField as FormikTextField } from 'formik-mui'

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
                size="small"
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

const SetNumberField: React.FC<
    FieldProps<GetNumber> & { prefix: React.ReactNode }
> = ({ field, form: { setFieldValue } }) => {
    if (typeof field.value.getNumber == 'function') return <div></div>

    const number = field.value.getNumber

    return (
        <TextField
            id={field.name}
            label="base"
            defaultValue={number}
            size="small"
            onChange={(number) => {
                setFieldValue(
                    field.name,
                    new RawGetNumber(Number.parseFloat(number.target.value))
                )
            }}
        />
    )
}

const StyleSchema = Yup.object().shape({
    opacity: Yup.number().min(0).max(1),
    strokeWidthScale: Yup.number().min(1).max(9),
    pointRadiusScale: Yup.number().min(1).max(9),
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
                        console.log(`Updating style: ${JSON.stringify(style)}`)
                        onClose()
                        dispatch(setStyle({ layer, style }))
                    }}
                >
                    {({ submitForm, handleChange, values }) => (
                        <Form>
                            <Grid container>
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

                            {values.getStrokeWidth && (
                                <div>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <Typography>
                                                Stroke Width
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Field
                                                id="getStrokeWidth"
                                                name="getStrokeWidth"
                                                component={SetNumberField}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <div
                                                style={{
                                                    justifyContent: 'center',
                                                    height: 1,
                                                    lineHeight: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <h3>*</h3>
                                            </div>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Field
                                                id="strokeWidthScale"
                                                name="strokeWidthScale"
                                                label="scale"
                                                size="small"
                                                component={FormikTextField}
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Select
                                                id="strokeWidthUnits"
                                                name="strokeWidthUnits"
                                                size="small"
                                                fullWidth
                                                defaultValue={
                                                    values.strokeWidthUnits
                                                }
                                                onChange={handleChange}
                                            >
                                                <MenuItem
                                                    value={'meters'}
                                                    key="meters"
                                                >
                                                    meters
                                                </MenuItem>

                                                <MenuItem
                                                    value={'pixels'}
                                                    key="pixels"
                                                >
                                                    pixels
                                                </MenuItem>

                                                <MenuItem
                                                    value={'common'}
                                                    key="common"
                                                >
                                                    common
                                                </MenuItem>
                                            </Select>
                                        </Grid>
                                    </Grid>
                                    {spacer()}
                                </div>
                            )}

                            {values.getPointRadius && (
                                <div>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <Typography>
                                                Point Radius
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <Field
                                                id="getPointRadius"
                                                name="getPointRadius"
                                                component={SetNumberField}
                                            />
                                        </Grid>

                                        <Grid item xs={1}>
                                            <div
                                                style={{
                                                    justifyContent: 'center',
                                                    height: 1,
                                                    lineHeight: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <h3>*</h3>
                                            </div>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <Field
                                                id="pointRadiusScale"
                                                name="pointRadiusScale"
                                                label="scale"
                                                size="small"
                                                component={FormikTextField}
                                            />
                                        </Grid>

                                        <Grid item xs={5}>
                                            <Select
                                                id="pointRadiusUnits"
                                                name="pointRadiusUnits"
                                                size="small"
                                                fullWidth
                                                defaultValue={
                                                    values.pointRadiusUnits
                                                }
                                                onChange={handleChange}
                                            >
                                                <MenuItem
                                                    value={'meters'}
                                                    key="meters"
                                                >
                                                    meters
                                                </MenuItem>

                                                <MenuItem
                                                    value={'pixels'}
                                                    key="pixels"
                                                >
                                                    pixels
                                                </MenuItem>

                                                <MenuItem
                                                    value={'common'}
                                                    key="common"
                                                >
                                                    common
                                                </MenuItem>
                                            </Select>
                                        </Grid>
                                    </Grid>
                                    {spacer()}
                                </div>
                            )}

                            <Grid container>
                                {values.full3D != null && (
                                    <Grid item xs={12}>
                                        <Field
                                            component={CheckboxWithLabel}
                                            type="checkbox"
                                            name="full3D"
                                            Label={{
                                                label: 'Draw polygons on plane with largest area?',
                                            }}
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Typography>Opacity</Typography>
                                    <Slider
                                        id="opacity"
                                        name="opacity"
                                        min={0}
                                        step={1e-2}
                                        max={1}
                                        value={values.opacity}
                                        valueLabelDisplay="auto"
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={submitForm}
                                        fullWidth={true}
                                    >
                                        Apply
                                    </Button>
                                </Grid>
                            </Grid>
                            {spacer()}
                        </Form>
                    )}
                </Formik>
            </Container>
        </Dialog>
    )
}
