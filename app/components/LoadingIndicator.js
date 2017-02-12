import CircularProgress from 'material-ui/CircularProgress';
import React from 'react';
import {blue900} from 'material-ui/styles/colors'

const LoadingIndicator = () => (
  <div style={{ marginTop: 24, textAlign: 'center' }}>
    <CircularProgress size={100} color={blue900}/>
  </div>
);

export default LoadingIndicator;
