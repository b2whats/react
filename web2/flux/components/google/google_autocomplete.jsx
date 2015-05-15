/**
* автокомплит
*/
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';

import gmapLoader from 'third_party/google_map.js';

@controllable(['results'])
export default class GoogleAutocomplete extends Component {
  static propTypes = {
    className: PropTypes.string,
    results: PropTypes.string.isRequired,
    onResultsChange: PropTypes.func.isRequired,
    apiKey: PropTypes.string
  };

  static defaultProps = {
    results: []
  };

  constructor(props) {
    super(props);
    this.inputRef = null;
    this.mounted_ = false;
    this.autocomplete = null;
  }

  _onResultsChange = (r) => {
    this.props.onResultsChange(r);
  }

  componentDidMount() {
    this.mounted_ = true;
    gmapLoader(this.props.apiKey)
    .then(maps => {
      if (!this.mounted_) {
        return;
      }

      this.autocomplete = new maps.places.Autocomplete(this.inputRef.getDOMNode(), { types: ['geocode'] });
      this.geocoder = new maps.Geocoder();

      maps.event.addListener(this.autocomplete, 'place_changed', () => {
        // let place = this.autocomplete.getPlace();
        const address = this.inputRef.getDOMNode().value;

        this.geocoder.geocode( { 'address': address}, (results, status) => {
          if (status === maps.GeocoderStatus.OK) {
            this._onResultsChange(results.map(r => r.formatted_address));
          }
        });
      });
    })
    .catch( e => {
      console.error(e); // eslint-disable-line no-console
      throw e;
    });
  }

  componentWillUnmount() {
    this.mounted_ = false;
  }

  render() {
    return (
      <div className={this.props.className}>
        <input style={{width: '100%'}} ref={ref => this.inputRef = ref} />
        <div>
          {this.props.results.map((r, index) => (<div key={index}>{r}</div>))}
        </div>
      </div>
    );
  }
}
