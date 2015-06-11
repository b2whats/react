/**
 * автокомплит
 */
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';
import cx from 'classnames';
import MapGoogle from 'components/account/filialAddressSelectorMap/map_data';
import gmapLoader from 'third_party/google_map.js';
import sc from 'shared_constants';
import autobind from 'utils/autobind.js';
@controllable(['results', 'selectedAddress', 'userMapCenter', 'ch'])
export default class GoogleAutocomplete extends Component {
  static propTypes = {
    className: PropTypes.string,
    onResultsChange: PropTypes.func.isRequired,
    onSelectedAddressChange: PropTypes.func.isRequired,
    onUserMapCenterChange: PropTypes.func.isRequired,
    apiKey: PropTypes.string
  };

  static defaultProps = {
    results: [],
    selectedAddress: null,
    userMapCenter: null,
    ch: false
  };

  constructor(props) {
    super(props);
    autobind(this);
    this.mounted_ = false;
    this.autocomplete = null;
  }

  _onResultsChange = (r) => {
    this.props.onResultsChange(r);
  }

  componentDidMount() {
    this.mounted_ = true;
    gmapLoader(sc.kGOOGLE_MAP_API_KEY)
      .then(maps => {
        if (!this.mounted_) {
          return;
        }

        this.autocomplete = new maps.places.Autocomplete(React.findDOMNode(this.refs.address), {types: ['geocode']});
        this.geocoder = new maps.Geocoder();
        var latlng = new maps.LatLng(this.props.center[0], this.props.center[1]);
        this.geocoder.geocode({'latLng': latlng}, function(results, status) {
          console.log(results);
        });


        if (this.props.formattedAddress) {
          const address = this.props.formattedAddress;

          this.geocoder.geocode({'address': address}, (results, status) => {
            if (status === maps.GeocoderStatus.OK) {
              this.onSelectedAddressChange(results[0])
              this._onResultsChange(results);
            }
          });
        }

        maps.event.addListener(this.autocomplete, 'place_changed', () => {
          // let place = this.autocomplete.getPlace();
          const address = React.findDOMNode(this.refs.address).value;

          this.geocoder.geocode({'address': address}, (results, status) => {
            if (status === maps.GeocoderStatus.OK) {
              this._onResultsChange(results);
            }
          });
        });
      })
      .catch(e => {
        console.error(e); // eslint-disable-line no-console
        throw e;
      });
  }

  onMapBoundsChange(center, zoom, bounds, marginBounds) {
    //console.log('change', center);
    this.props.onCenterChange(center);

  }

  componentWillUnmount() {
    this.mounted_ = false;
  }

  onSelectedAddressChange(r) {
    console.log(r);
    r && this.props.onAddressChange([r.geometry.location.A, r.geometry.location.F], r);
    this.props.onChChange(false);
  }

  renderAddressList(list) {
    let addresses = list
      .slice(0, 10)
      .map((r, index) => (
        <li
          className="p5 H-bgc-grey-100 cur-p ellipsis"
          key={index}
          onClick={this.onSelectedAddressChange.bind(null, r)}
          >
          {r.formatted_address}
        </li>
      ));
    return (
      <ul className="m0 p0 fs12 w100pr lst-N">
        {addresses}
      </ul>

    );
  }

  render() {
    let {results, selectedAddress} = this.props;
    let hasShowSelectAddressList = results.length > 0 && !this.props.formattedAddress || this.props.ch;
    let center = [];
    if (this.props.center) {
      center = this.props.center;
    }
    if (this.props.userMapCenter) {
      center = this.props.userMapCenter;
    }
//('center', center);
    return (
      <div className={this.props.className}>
        <div className={cx((this.props.formattedAddress && !this.props.ch) && 'd-N')}>
          <h3 className="fs18 fw-n m0">Введите адрес</h3>
          <input type="text" className="w100pr m5-0" ref="address" />
        </div>
        {hasShowSelectAddressList &&
        <div className="m5">
          <h3 className="fs14 fw-n m5 bB1s bc-grey-400 pB5">Уточните адрес:</h3>
          {this.renderAddressList(results)}
        </div>
        }
        {(this.props.formattedAddress && !this.props.ch) &&
        <div>
          <div className="entire-width bB1s bc-grey-400 flex-ai-c">
            <h3 className="fs14 fw-n m5">Выбранный адрес:</h3>
              <span
                className="c-deep-purple-500 cur-p fs11 va-M"
                onClick={this.props.onChChange.bind(null, true)}
                >
                изменить
              </span>
          </div>
          <div className="m5 fs12">{this.props.formattedAddress}</div>
          <div className="p-r m10-0 h230px w100pr">
            <i
              style={{position: 'absolute', bottom: '50%', zIndex: '10', left: '50%', marginLeft: '-7px'}}
              className={cx('fs20 icon_placemark-' + (this.props.companyType == 1 ? 'ap' : 'as'))}
              />
            <MapGoogle oMapBoundsChange={this.onMapBoundsChange} center={center}/>
          </div>
        </div>
        }

      </div>
    );
  }
}
