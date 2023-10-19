import { GeoLayer, TileGeoLayer } from '../core/GeoLayer'
import { Box, Button, Container, Dialog, DialogTitle } from '@mui/material'
import { FormContainer, TextFieldElement } from 'react-hook-form-mui'

export interface AddLayerProps {
    open: boolean
    onClose: (newLayer?: GeoLayer) => void
}

export const AddLayerDialog = (props: AddLayerProps) => {
    const { open, onClose } = props

    const spacer = () => <Box sx={{ height: 16 }}></Box>

    return (
        <Dialog onClose={() => onClose()} open={open}>
            <DialogTitle>Add Layer</DialogTitle>
            <Container sx={{ width: 480 }}>
                <FormContainer
                    defaultValues={{
                        name: '',
                        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        minZoom: 0,
                        maxZoom: 19,
                    }}
                    onSuccess={(data) =>
                        onClose(
                            new TileGeoLayer({
                                name: data.name,
                                active: true,
                                url: data.url,
                                minZoom: data.minZoom,
                                maxZoom: data.maxZoom,
                            })
                        )
                    }
                >
                    <TextFieldElement
                        sx={{ width: 1 }}
                        name="name"
                        label="Name"
                        required
                    />
                    {spacer()}
                    <TextFieldElement
                        sx={{ width: 1 }}
                        name="url"
                        label="URL"
                        required
                    />
                    {spacer()}
                    <TextFieldElement
                        sx={{ width: 1 }}
                        name="minZoom"
                        type={'number'}
                        label="Min Zoom Level"
                        required
                    />
                    {spacer()}
                    <TextFieldElement
                        sx={{ width: 1 }}
                        name="maxZoom"
                        label="Max Zoom Level"
                        type={'number'}
                        required
                    />
                    {spacer()}
                    <Button type="submit" variant="contained" sx={{ width: 1 }}>
                        Submit
                    </Button>
                    {spacer()}
                </FormContainer>
            </Container>
        </Dialog>
    )
}
