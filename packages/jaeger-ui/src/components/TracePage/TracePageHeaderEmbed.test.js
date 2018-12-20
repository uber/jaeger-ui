// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { shallow, mount } from 'enzyme';

import { TracePageHeaderEmbedFn as TracePageHeaderEmbed, HEADER_ITEMS } from './TracePageHeaderEmbed';
import LabeledList from '../common/LabeledList';

describe('<TracePageHeaderEmbed>', () => {
  const defaultProps = {
    traceID: 'some-trace-id',
    name: 'some-trace-name',
    textFilter: '',
    updateTextFilter: () => {},
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<TracePageHeaderEmbed {...defaultProps} />);
  });

  it('renders a <header />', () => {
    expect(wrapper.find('header').length).toBe(1);
  });

  it('renders an empty <div> if no traceID is present', () => {
    wrapper = mount(<TracePageHeaderEmbed {...defaultProps} traceID={null} />);
    expect(wrapper.children().length).toBe(0);
  });

  it('renders the trace title', () => {
    const h1 = wrapper.find('h1').first();
    expect(h1.contains(defaultProps.name)).toBeTruthy();
  });

  it('renders the header items', () => {
    wrapper.find('.horizontal .item').forEach((item, i) => {
      expect(item.contains(HEADER_ITEMS[i].title)).toBeTruthy();
      expect(item.contains(HEADER_ITEMS[i].renderer(defaultProps.trace))).toBeTruthy();
    });
  });

  it('show details if queryparam enableDetails', () => {
    wrapper.setProps({ enableDetails: true });
    expect(wrapper.find(LabeledList).length).toBe(1);
  });
});
