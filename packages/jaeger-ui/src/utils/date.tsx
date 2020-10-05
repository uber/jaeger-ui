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

import moment from 'moment';
import _dropWhile from 'lodash/dropWhile';
import _round from 'lodash/round';

import { toFloatPrecision } from './number';

const TODAY = 'Today';
const YESTERDAY = 'Yesterday';

export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD';
export const STANDARD_TIME_FORMAT = 'HH:mm';
export const STANDARD_DATETIME_FORMAT = 'MMMM D YYYY, HH:mm:ss.SSS';
export const ONE_MILLISECOND = 1000;
export const ONE_SECOND = 1000 * ONE_MILLISECOND;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const DEFAULT_MS_PRECISION = Math.log10(ONE_MILLISECOND);

const UNIT_STEPS: { unit: string; microseconds: number; maximum: number }[] = [
  { unit: 'd', microseconds: ONE_DAY, maximum: Infinity },
  { unit: 'h', microseconds: ONE_HOUR, maximum: 24 },
  { unit: 'm', microseconds: ONE_MINUTE, maximum: 60 },
  { unit: 's', microseconds: ONE_SECOND, maximum: 60 },
  { unit: 'ms', microseconds: ONE_MILLISECOND, maximum: 1000 },
  { unit: 'μs', microseconds: 1, maximum: 1000 },
];

/**
 * @param {number} timestamp
 * @param {number} initialTimestamp
 * @param {number} totalDuration
 * @return {number} 0-100 percentage
 */
export function getPercentageOfDuration(duration: number, totalDuration: number) {
  return (duration / totalDuration) * 100;
}

const quantizeDuration = (duration: number, floatPrecision: number, conversionFactor: number) =>
  toFloatPrecision(duration / conversionFactor, floatPrecision) * conversionFactor;

/**
 * @param {number} duration (in microseconds)
 * @return {string} formatted, unit-labelled string with time in milliseconds
 */
export function formatDate(duration: number) {
  return moment(duration / ONE_MILLISECOND).format(STANDARD_DATE_FORMAT);
}

/**
 * @param {number} duration (in microseconds)
 * @return {string} formatted, unit-labelled string with time in milliseconds
 */
export function formatTime(duration: number) {
  return moment(duration / ONE_MILLISECOND).format(STANDARD_TIME_FORMAT);
}

/**
 * @param {number} duration (in microseconds)
 * @return {string} formatted, unit-labelled string with time in milliseconds
 */
export function formatDatetime(duration: number) {
  return moment(duration / ONE_MILLISECOND).format(STANDARD_DATETIME_FORMAT);
}

/**
 * @param {number} duration (in microseconds)
 * @return {string} formatted, unit-labelled string with time in milliseconds
 */
export function formatMillisecondTime(duration: number) {
  const targetDuration = quantizeDuration(duration, DEFAULT_MS_PRECISION, ONE_MILLISECOND);
  return `${moment.duration(targetDuration / ONE_MILLISECOND).asMilliseconds()}ms`;
}

/**
 * @param {number} duration (in microseconds)
 * @return {string} formatted, unit-labelled string with time in seconds
 */
export function formatSecondTime(duration: number) {
  const targetDuration = quantizeDuration(duration, DEFAULT_MS_PRECISION, ONE_SECOND);
  return `${moment.duration(targetDuration / ONE_MILLISECOND).asSeconds()}s`;
}

/**
 * Humanizes the duration based on the inputUnit
 *
 * Example:
 * 5000ms => 5s
 * 1000μs => 1ms
 */
export function formatDuration(duration: number, inputUnit: string = 'microseconds'): string {
  if (duration < 1) {
    return `${_round(duration, 2)}μs`;
  }

  // Find the amount of each unit
  const unitValues = UNIT_STEPS.map<[number, string]>(({ unit, microseconds, maximum }) => [
    (duration / microseconds) % maximum,
    unit,
  ]);

  // Remove values less than 1
  return (
    _dropWhile(unitValues, ([value]) => value < 1)
      // Display a maximum of three units
      .slice(0, 3)
      // Round the final value and floor the rest
      .map<[number, string]>(([value, unit], index, all) => [
        index === all.length - 1 ? Math.round(value) : Math.floor(value),
        unit,
      ])
      // Skip intermediate values less than one
      .filter(([value]) => value >= 1)
      // Floor all other numbers
      .map(([value, unit]) => `${value}${unit}`)
      .join(' ')
  );
}

export function formatRelativeDate(value: any, fullMonthName: boolean = false) {
  const m = moment.isMoment(value) ? value : moment(value);
  const monthFormat = fullMonthName ? 'MMMM' : 'MMM';
  const dt = new Date();
  if (dt.getFullYear() !== m.year()) {
    return m.format(`${monthFormat} D, YYYY`);
  }
  const mMonth = m.month();
  const mDate = m.date();
  const date = dt.getDate();
  if (mMonth === dt.getMonth() && mDate === date) {
    return TODAY;
  }
  dt.setDate(date - 1);
  if (mMonth === dt.getMonth() && mDate === dt.getDate()) {
    return YESTERDAY;
  }
  return m.format(`${monthFormat} D`);
}
