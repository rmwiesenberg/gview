import { geoLayerFromFile, TileGeoLayer } from '../common/GeoLayer'
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    Grid,
    Tab,
    Tabs,
} from '@mui/material'
import React from 'react'
import { DropzoneArea } from 'react-mui-dropzone'
import { useAppDispatch } from '../app/hook'
import { addLayer } from '../features/layersSlice'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-mui'
import * as Yup from 'yup'

type CloseFormCallback = () => void

export interface AddLayerProps {
    open: boolean
    onClose: CloseFormCallback
}

const spacer = () => <Box sx={{ height: 16 }}></Box>

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const XYZTileLayerSchema = Yup.object().shape({
    name: Yup.string().min(1, 'Too Short').required('Required'),
    url: Yup.string().required('Required'),
    minZoom: Yup.number()
        .integer('Must be an integer')
        .min(0, 'Zoom cannot be less than 0'),
    maxZoom: Yup.number().integer('Must be an integer'),
})

const AddXYZTileLayer = (cb: CloseFormCallback) => {
    const dispatch = useAppDispatch()

    return (
        <Formik
            initialValues={{
                name: '',
                url: '',
                minZoom: 0,
                maxZoom: 19,
            }}
            validationSchema={XYZTileLayerSchema}
            onSubmit={(values, actions) => {
                cb()
                dispatch(addLayer(new TileGeoLayer(values)))
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

                <Field
                    component={TextField}
                    id="url"
                    name="url"
                    label="URL"
                    fullWidth={true}
                    helperText="https://my.tileserver.com/{z}/{x}/{y}.png"
                />
                {spacer()}

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Field
                            component={TextField}
                            id="minZoom"
                            name="minZoom"
                            label="Min Zoom"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Field
                            component={TextField}
                            id="maxZoom"
                            name="maxZoom"
                            label="Max Zoom"
                        />
                    </Grid>
                </Grid>
                {spacer()}

                <Button type="submit" variant="contained" fullWidth={true}>
                    Submit
                </Button>
            </Form>
        </Formik>
    )
}

const AddFileLayerForm = (cb: CloseFormCallback) => {
    const dispatch = useAppDispatch()

    const handleChange = async (files: File[]) => {
        if (files.length === 0) return
        cb()
        for (const file of files) {
            for await (let newLayer of geoLayerFromFile(file)) {
                dispatch(addLayer(newLayer))
            }
        }
    }

    return (
        <DropzoneArea
            acceptedFiles={['.gpkg', '.geojson']}
            filesLimit={1000}
            maxFileSize={1024 * 10e6}
            dropzoneText={'Drag and drop an file here or click'}
            onChange={handleChange.bind(this)}
        />
    )
}

export const AddLayerDialog = (props: AddLayerProps) => {
    const { open, onClose } = props

    const [value, setValue] = React.useState(0)

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Add Layer</DialogTitle>
            <Container>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={(_, newValue) => setValue(newValue)}
                        aria-label="Add Layer Tabs"
                    >
                        <Tab label="File Upload" {...a11yProps(0)} />
                        <Tab label="XYZ Tile Server" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    {AddFileLayerForm(onClose)}
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    {AddXYZTileLayer(onClose)}
                </CustomTabPanel>
            </Container>
        </Dialog>
    )
}
