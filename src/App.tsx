import DeckGL from '@deck.gl/react/typed';
import {TileLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';
import {ViewState} from "./core/ViewState";

const initialViewState: ViewState = {
  longitude: -83.0,
  latitude: 42.33,
  zoom: 11
}

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

  return <DeckGL initialViewState={initialViewState} layers={[layer]} controller={true} />;
}

export default App;
