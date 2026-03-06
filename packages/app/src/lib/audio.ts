import type { Tagged } from 'type-fest';

export type Time = Tagged<number, 'Time'>;

export type MonoSignal = number;

export type MonoRenderer = (t: Time) => MonoSignal;

export type StereoSignal = [number, number];

export type StereoRenderer = (t: Time) => StereoSignal;

// @todo consider adding more branding (e.g. `Frequency`, `Interval`...)
