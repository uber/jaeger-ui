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

/* eslint-disable no-bitwise */

import memoizeOne from 'memoize-one';

const VISIBILITY_BUCKET_SIZE = 31;

const getBuckets = memoizeOne((visibilityKey: string): number[] =>
  visibilityKey.split(',').map(partial => parseInt(partial || '0', 36))
);

function convertIdxToBucketValues(visibilityIdx: number) {
  const bucketIdx = Math.floor(visibilityIdx / VISIBILITY_BUCKET_SIZE);
  const digitIdx = visibilityIdx % VISIBILITY_BUCKET_SIZE;
  const visibilityValue = 1 << digitIdx;
  const visibilityCompliment = ~visibilityValue;
  return { bucketIdx, digitIdx, visibilityValue, visibilityCompliment };
}

export function isVisible(visibilityKey: string, visibilityIdx: number): boolean {
  const visibilityBuckets = getBuckets(visibilityKey);
  const { bucketIdx, visibilityValue } = convertIdxToBucketValues(visibilityIdx);
  return Boolean(visibilityBuckets[bucketIdx] & visibilityValue);
}

export function changeKey({ key, show, hide }: { key: string; show?: number[]; hide?: number[] }): string {
  const visibilityBuckets = getBuckets(key).slice();
  const conflictCheck = new Set(show);

  if (hide) {
    hide.forEach(hideIdx => {
      if (conflictCheck.has(hideIdx)) {
        throw new Error(`Trying to show and hide same visibilityIdx: ${hideIdx} in same change`);
      }
      const { bucketIdx, visibilityCompliment } = convertIdxToBucketValues(hideIdx);
      visibilityBuckets[bucketIdx] &= visibilityCompliment;
    });
  }

  if (show) {
    show.forEach(showIdx => {
      const { bucketIdx, visibilityValue } = convertIdxToBucketValues(showIdx);
      visibilityBuckets[bucketIdx] |= visibilityValue;
    });
  }

  return visibilityBuckets
    .map(bucket => bucket.toString(36))
    .map(value => (value === '0' ? '' : value))
    .join(',');
}

export function createKey(visibleIndices: number[]) {
  return changeKey({ key: '', show: visibleIndices });
}

// TODO: determine if memo is even necessary
// export const compareVisibilityKeys = memoizeOne(function compareVisibilityKeysImpl({
export function compareKeys({
  newKey,
  oldKey,
}: {
  newKey: string;
  oldKey: string;
}): { added: number[]; removed: number[] } {
  const added: number[] = [];
  const removed: number[] = [];
  const oldBuckets = getBuckets(oldKey).slice();
  const newBuckets = getBuckets(newKey).slice();
  for (let i = 0; i < Math.max(oldBuckets.length, newBuckets.length); i++) {
    for (let j = 0; j < VISIBILITY_BUCKET_SIZE; j++) {
      if (newBuckets[i] & (1 << j) && !(oldBuckets[i] & (1 << j))) {
        added.push(i * VISIBILITY_BUCKET_SIZE + j);
      } else if (oldBuckets[i] & (1 << j) && !(newBuckets[i] & (1 << j))) {
        removed.push(i * VISIBILITY_BUCKET_SIZE + j);
      }
    }
  }
  return { added, removed };
}
/*
, ([{
  newVisibilityKey: currNewVisibilityKey,
  oldVisibilityKey: currOldVisibilityKey,
}], [{
  newVisibilityKey: prevNewVisibilityKey,
  oldVisibilityKey: prevOldVisibilityKey,
}]) => currNewVisibilityKey === prevNewVisibilityKey && currOldVisibilityKey === prevOldVisibilityKey);
*/