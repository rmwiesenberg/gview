import DeckGL from '@deck.gl/react/typed';
import {styled} from '@mui/material/styles';
import {TileLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {ViewState} from "./core/ViewState";
import {Box, Card, CardActions, CardContent, CardHeader, Collapse, IconButton, IconButtonProps,} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

const initialViewState: ViewState = {
  longitude: -83.0,
  latitude: 42.33,
  zoom: 11
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function App() {
  const layer = new TileLayer({
    id: 'TileLayer',
    data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

    maxZoom: 19,
    minZoom: 0,

    renderSubLayers: props => {
      const {
        // @ts-ignore
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north]
      });
    },
  });


  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return <div>
    <Box p={3}>
      <Card sx={{minWidth: 150, maxWidth: 300}} style={{position:"relative", zIndex: "1"}}>
        <CardHeader
          action={
            <IconButton aria-label="add layer">
              <AddIcon />
            </IconButton>
          }
          title="Layers"
        />
        <CardActions disableSpacing>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
    <DeckGL initialViewState={initialViewState} layers={[layer]} controller={true} />
  </div>;
}

export default App;
