/* eslint camelcase: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import ExploreViewContainer from './components/ExploreViewContainer';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { now } from '../modules/dates';
import { initEnhancer } from '../reduxUtils';
import { applyDefaultFormData } from './stores/store';

// jquery and bootstrap required to make bootstrap dropdown menu's work
const $ = window.$ = require('jquery'); // eslint-disable-line
const jQuery = window.jQuery = require('jquery'); // eslint-disable-line
require('bootstrap');
require('./main.css');

import { initialState } from './stores/store';
import { fields } from './stores/fields';

const exploreViewContainer = document.getElementById('js-explore-view-container');
const bootstrapData = JSON.parse(exploreViewContainer.getAttribute('data-bootstrap'));

import { exploreReducer } from './reducers/exploreReducer';
const form_data = applyDefaultFormData(bootstrapData.form_data);

const bootstrappedState = Object.assign(
  bootstrapData, {
    chartStatus: 'loading',
    chartUpdateEndTime: null,
    chartUpdateStartTime: now(),
    dashboards: [],
    fields,
    filterColumnOpts: [],
    form_data,
    isDatasourceMetaLoading: false,
    isStarred: false,
    queryResponse: null,
  }
);

function parseFilters(form_data, prefix = 'flt') {
  const filters = [];
  for (let i = 0; i <= 10; i++) {
    if (form_data[`${prefix}_col_${i}`] && form_data[`${prefix}_op_${i}`]) {
      filters.push({
        prefix,
        col: form_data[`${prefix}_col_${i}`],
        op: form_data[`${prefix}_op_${i}`],
        value: form_data[`${prefix}_eq_${i}`],
      });
    }
    /* eslint no-param-reassign: 0 */
    delete form_data[`${prefix}_col_${i}`];
    delete form_data[`${prefix}_op_${i}`];
    delete form_data[`${prefix}_eq_${i}`];
  }
  return filters;
}

function getFilters(form_data, datasource_type) {
  if (datasource_type === 'table') {
    return parseFilters(form_data);
  }
  return parseFilters(form_data).concat(parseFilters(form_data, 'having'));
}

bootstrappedState.form_data.filters = getFilters(form_data, bootstrapData.datasource_type);

const store = createStore(exploreReducer, bootstrappedState,
  compose(applyMiddleware(thunk), initEnhancer(false))
);

ReactDOM.render(
  <Provider store={store}>
    <ExploreViewContainer />
  </Provider>,
  exploreViewContainer
);
