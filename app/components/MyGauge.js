import Gauge from 'react-gauge-test';
import React from 'react';

function get_radius(cols) {
  if (cols == 4) return window.innerWidth/30;
  else if (cols == 2) return window.innerWidth / 12;
  else return window.innerWidth/7;
}

const MyGauge = ({ marks, value, columns, ranges }) => (
  <Gauge radius={get_radius(columns)}
         contentWidth={get_radius(columns)*4.5}
         aperture={120} arcStrokeWidth={10}
         svgContainerHeight={get_radius(columns)*3.5}
         className="gauge-container" marks={marks}
         ranges={ranges}
         arrowValue={value > marks[marks.length - 1] ? 1 : value/(marks[marks.length - 1] - marks[0])}/>
);

React.propTypes = {
  marks: React.PropTypes.array,
  value: React.PropTypes.number,
  columns: React.PropTypes.number,
  ranges: React.PropTypes.array,
};

export default MyGauge;