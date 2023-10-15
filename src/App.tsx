import DeckGL from '@deck.gl/react/typed';
import {TileLayer} from '@deck.gl/geo-layers/typed';
import {BitmapLayer} from '@deck.gl/layers/typed';

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

  return <DeckGL initialViewState={{latitude:40.7, longitude:-74, zoom:11}} layers={[layer]} />;
}

export default App;
