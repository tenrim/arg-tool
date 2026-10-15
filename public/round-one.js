import {initAnalysis} from './round1/analysis.js';
import {initSubstitution} from './round1/substitution.js';
import {initHanzi} from './round1/hanzi.js';
import {initInstruments} from './round1/instruments.js';
import {initCube} from './round1/cube.js';
import {initQR} from './round1/qr.js';
import {initSymbols} from './round1/symbols.js';
export function initRoundOne(){initAnalysis();initSubstitution();initHanzi();initInstruments();initCube();initQR();initSymbols();}
