/*\
|*| This is a presentational container just used to render a list of pools.
|*| The logic to perform actions on individual list items is contained within
|*| the PoolListItem container.
|*|
|*| This is a presentational (or "dumb") compnent. It's only responsible for
|*| rendering DOM nodes or other components. Presentation components should not
|*| include any logic.
\*/

// by convention, the imports are split into two groups, 3rd party libs and src
// modules. The imports in those groups are then ordered alphabetically by their
// source name (the string value on the right of "from").
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import { List } from 'material-ui/List';
import React from 'react';
import PoolListItemContainer from './PoolListItemContainer';

// Unfortunately material-ui makes it difficult to overwrite it's component
// styles using css classes, a lot of the time you have to use inline styles.
const listItemStyle = { paddingTop: 0, paddingBottom: 0 };

const PoolList = ({ pools }) => (
  <Paper className="container">
    <List style={listItemStyle}>
      {pools.map(pool => [
        <PoolListItemContainer
          key={pool.serialnumber}
          pool={pool}
        />,
        <Divider key={`divider-${pool.serialnumber}`} />,
      ])}
    </List>
  </Paper>
);

PoolList.propTypes = {
  pools: React.PropTypes.array.isRequired,
};

export default PoolList;
