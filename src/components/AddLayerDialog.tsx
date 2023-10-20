import { GeoLayer, geoLayerFromFile, TileGeoLayer } from '../core/GeoLayer'
import { useDropzone } from 'react-dropzone'
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
import React, { useCallback } from 'react'

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
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        let newLayers: GeoLayer[] = []
        for (const file of acceptedFiles) {
            const layersFromFile = await geoLayerFromFile(file)
            if (layersFromFile != null) newLayers.push(...layersFromFile)
        }
        submit(newLayers)
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    })

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here ...</p>
            ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
            )}
        </div>
    )
}

export const AddLayerDialog = (props: AddLayerProps) => {
    const { open, onClose } = props

    const [value, setValue] = React.useState(0)

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Add Layer</DialogTitle>
            <Container sx={{ minWidth: 480, height: 500 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={(_, newValue) => setValue(newValue)}
                        aria-label="basic tabs example"
                    >
                        <Tab label="XYZ Tile Server" {...a11yProps(0)} />
                        <Tab label="File Upload" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <Box
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ height: '100%' }}></Box>
                    <CustomTabPanel value={value} index={0}>
                        {AddXYZTileLayer(onClose)}
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        {AddFileLayerForm(onClose)}
                    </CustomTabPanel>
                    <Box sx={{ height: '100%' }}></Box>
                </Box>
            </Container>
        </Dialog>
    )
}
