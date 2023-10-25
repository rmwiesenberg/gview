import { GeoLayer, geoLayerFromFile, TileGeoLayer } from '../core/GeoLayer'
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    Tab,
    Tabs,
} from '@mui/material'
import { FormContainer, TextFieldElement } from 'react-hook-form-mui'
import React from 'react'
import { DropzoneArea } from 'react-mui-dropzone'

type CloseFormCallback = (newLayers?: GeoLayer[]) => void

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

const AddXYZTileLayer = (submit: CloseFormCallback) => {
    return (
        <FormContainer
            defaultValues={{
                name: '',
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                minZoom: 0,
                maxZoom: 19,
            }}
            onSuccess={(data) =>
                submit([
                    new TileGeoLayer({
                        name: data.name,
                        active: true,
                        url: data.url,
                        minZoom: data.minZoom,
                        maxZoom: data.maxZoom,
                    }),
                ])
            }
        >
            <TextFieldElement
                fullWidth={true}
                name="name"
                label="Name"
                required
            />
            {spacer()}
            <TextFieldElement
                fullWidth={true}
                name="url"
                label="URL"
                required
            />
            {spacer()}
            <TextFieldElement
                fullWidth={true}
                name="minZoom"
                type={'number'}
                label="Min Zoom Level"
                required
            />
            {spacer()}
            <TextFieldElement
                fullWidth={true}
                name="maxZoom"
                label="Max Zoom Level"
                type={'number'}
                required
            />
            {spacer()}
            <Button type="submit" variant="contained" fullWidth={true}>
                Submit
            </Button>
            {spacer()}
        </FormContainer>
    )
}

const AddFileLayerForm = (submit: CloseFormCallback) => {
    const handleChange = async (files: File[]) => {
        if (files.length === 0) return
        let newLayers: GeoLayer[] = []
        for (const file of files) {
            const layersFromFile = await geoLayerFromFile(file)
            if (layersFromFile != null) newLayers.push(...layersFromFile)
        }
        submit(newLayers)
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
            <Container sx={{ minWidth: 480 }}>
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
