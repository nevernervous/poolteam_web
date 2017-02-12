import FloatingActionButton from 'material-ui/FloatingActionButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import {blue900} from 'material-ui/styles/colors';
import React from 'react';

const FAB = props => (
  <div className="FAB-outer-container">
    <div className="FAB-inner-container">
      <FloatingActionButton
        className="FAB"
        backgroundColor={blue900}
        {...props}
      >
        <AddIcon />
      </FloatingActionButton>
    </div>
  </div>
);

export default FAB;
