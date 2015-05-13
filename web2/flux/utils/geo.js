import LatLng from './lib_geo/lat_lng.js';
import Point from 'point-geometry';
import Transform from './lib_geo/transform.js';


export default class Geo {

  constructor(tileSize, viewFromLeftTop) { // left_top view пользует гугл
    // super();
    this.has_size = false;
    this.has_view = false;
    this.transform = new Transform(tileSize || 512);
    this.viewFromLeftTop = !!viewFromLeftTop;
  }

  setView(center, zoom, bearing) {
    this.transform.center = LatLng.convert(center);
    this.transform.zoom = +zoom;
    this.transform.bearing = +bearing;
    this.has_view = true;
  }

  setViewSize(width, height) {
    this.transform.width = width;
    this.transform.height = height;
    this.has_size = true;
  }

  canProject() {
    return this.has_size && this.has_view;
  }

  unproject(ptXY) {
    if (this.viewFromLeftTop) {
      const ptxy = Object.assign({}, ptXY);
      ptxy.x += this.transform.width / 2;
      ptxy.y += this.transform.height / 2;
      let ptRes = this.transform.pointLocation(Point.convert(ptxy));

      if (ptRes.lng > 180) {
        ptRes.lng = -360 + ptRes.lng;
      }
      return ptRes;
    }

    return this.transform.pointLocation(Point.convert(ptXY));
  }

  project(ptLatLng) {
    if (this.viewFromLeftTop) {
      const pt = this.transform.locationPoint(LatLng.convert(ptLatLng));
      pt.x -= this.transform.width / 2;
      pt.y -= this.transform.height / 2;
      return pt;
    }

    return this.transform.locationPoint(LatLng.convert(ptLatLng));
  }

  getWidth() {
    return this.transform.width;
  }

  getHeight() {
    return this.transform.height;
  }

  getZoom() {
    return this.transform.zoom;
  }

  getCenter() {
    return this.unproject({x: this.getWidth() / 2, y: this.getHeight() / 2});
  }

  getBounds(margins, roundFactor) {
    const bndT = margins && margins[0] || 0;
    const bndR = margins && margins[1] || 0;
    const bndB = margins && margins[2] || 0;
    const bndL = margins && margins[3] || 0;

    if (this.getWidth() - bndR - bndL > 0 && this.getHeight() - bndT - bndB > 0) {
      const topLeftCorner = this.unproject({x: bndL, y: bndT});
      const bottomRightCorner = this.unproject({x: this.getWidth() - bndR, y: this.getHeight() - bndB});

      let res = [
        topLeftCorner.lat, topLeftCorner.lng,
        bottomRightCorner.lat, bottomRightCorner.lng
      ];

      if (roundFactor) {
        res = res.map(r => Math.round(r * roundFactor) / roundFactor);
      }
      return res;
    }

    return [0, 0, 0, 0];
  }
}

