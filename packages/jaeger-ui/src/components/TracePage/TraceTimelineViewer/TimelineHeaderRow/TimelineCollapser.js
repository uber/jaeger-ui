// @flow

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

import { Tooltip, Icon } from 'antd';

import './TimelineCollapser.css';
import type { Span } from '../../../../types';

type CollapserProps = {
  onCollapseAll: (Span[]) => void,
  onCollapseOne: (Span[]) => void,
  onExpandOne: (Span[]) => void,
  onExpandAll: () => void,
  spans: Span[],
};

export default function TimelineCollapser(props: CollapserProps) {
  const { onExpandAll, onExpandOne, onCollapseAll, onCollapseOne, spans } = props;
  const _onCollapseAll = () => onCollapseAll(spans);
  const _onExpandOne = () => onExpandOne(spans);
  const _onCollapseOne = () => onCollapseOne(spans);
  return (
    <span className="TimelineCollapser">
      <Tooltip title="Expand +1">
        <Icon type="right" onClick={_onExpandOne} />
      </Tooltip>
      <Tooltip title="Collapse +1">
        <Icon type="left" onClick={_onCollapseOne} />
      </Tooltip>
      <Tooltip title="Expand All">
        <Icon type="double-right" onClick={onExpandAll} />
      </Tooltip>
      <Tooltip title="Collapse All">
        <Icon type="double-left" onClick={_onCollapseAll} />
      </Tooltip>
    </span>
  );
}
