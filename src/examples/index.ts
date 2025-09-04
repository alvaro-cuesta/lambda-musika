import ArpeggioSequencer from './arpeggio_sequencer.musika?raw';
import Binaural from './binaural.musika?raw';
import Default from './default.musika?raw';
import Exhale from './exhale.musika?raw';
import FilteredNoise from './filtered_noise.musika?raw';
import PoppingWip from './popping_wip.musika?raw';
import Sea from './sea.musika?raw';
import ThxClone from './thx_clone.musika?raw';

export const EXAMPLE_SCRIPTS = {
  Default: Default,
  'Binaural Beat': Binaural,
  'Filtered Noise': FilteredNoise,
  Sea: Sea,
  Exhale: Exhale,
  'Arpeggio + Sequencer': ArpeggioSequencer,
  'THX Clone': ThxClone,
  'Popping (WIP)': PoppingWip,
} as const;
