// Copyright (c) 2019 Uber Technologies, Inc.
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

import { shallow } from 'enzyme';

import getNodeLabel from './index';

describe('getNodeLabel()', () => {
  it('returns a <DdgNode/>', () => {
    const operation = 'the-operation';
    const service = 'the-service';
    const ddgNode = getNodeLabel({ operation, service });
    expect(ddgNode).toBeDefined();
    const wrapper = shallow(ddgNode);
    expect(wrapper).toMatchSnapshot();
    // set as the focal node
    // TODO(joe): update test after vertex indicates focal node or not
    // pathElem.memberIdx = focalIdx;
    // ddgNode = getNodeLabel({ pathElems });
    // expect(ddgNode).toBeDefined();
    // wrapper = shallow(ddgNode);
    // expect(wrapper).toMatchSnapshot();
  });

  it('throws an error if given a vertex without any path elements', () => {
    const pathElems = new Set();
    expect(() => getNodeLabel({ pathElems })).toThrow();
  });
});