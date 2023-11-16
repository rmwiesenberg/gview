import { GeoLayer } from '../common/GeoLayer'
import { Box, Button, Container, Dialog, DialogTitle } from '@mui/material'
import React from 'react'
import { useAppDispatch } from '../app/hook'
import { replaceLayer } from '../features/layersSlice'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { TextField } from 'formik-mui'

type CloseFormCallback = () => void

export interface EditLayerProps {
    layer: GeoLayer | null
    open: boolean
    onClose: CloseFormCallback
}

const spacer = () => <Box sx={{ height: 16 }}></Box>

const EditLayerSchema = Yup.object().shape({
    name: Yup.string().min(1, 'Too Short').required('Required'),
})

export const EditLayerDialog = (props: EditLayerProps) => {
    const { layer, open, onClose } = props

    const dispatch = useAppDispatch()

    if (layer == null) return <div></div>

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Edit Layer</DialogTitle>
            <Container sx={{ width: 480 }}>
                <Formik
                    initialValues={{
                        name: layer.name,
                    }}
                    validationSchema={EditLayerSchema}
                    onSubmit={(values) => {
                        console.log(values.name)
                        onClose()
                        let clone = Object.assign(
                            Object.create(Object.getPrototypeOf(layer)),
                            layer
                        )
                        clone.name = values.name
                        console.log(values.name)
                        console.log(clone.name)
                        dispatch(replaceLayer([layer, clone]))
                    }}
                >
                    <Form>
                        <Field
                            component={TextField}
                            id="name"
                            name="name"
                            label="Name"
                            fullWidth={true}
                        />
                        {spacer()}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth={true}
                        >
                            Submit
                        </Button>
                        {spacer()}
                    </Form>
                </Formik>
            </Container>
        </Dialog>
    )
}
