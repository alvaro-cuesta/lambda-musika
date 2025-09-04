export type MonoSignal = number;

export type MonoRenderer = (t: number) => MonoSignal;

export type StereoSignal = [number, number];

export type StereoRenderer = (t: number) => StereoSignal;
