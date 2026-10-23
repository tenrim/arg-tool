import {mountClassical} from './classical-view.js';
import {mountElements} from './element-view.js';
import {mountStrokes} from './stroke-view.js';
import {mountScore} from './score-view.js';
import {mountConstraints} from './constraints-view.js';
import {mountAlpertron} from './alpertron-view.js';
import {mountMorse} from './morse-view.js';
import {mountKeyboard} from './keyboard-view.js';
import {mountCompletion} from '../completion/views.js';
export function mountExpansion(host,options){
 const results=[mountClassical(host),mountElements(host),mountStrokes(host),mountScore(host),mountConstraints(host),mountAlpertron(host),mountMorse({host,...options}),mountKeyboard(host),mountCompletion(host)];
 const sessions=new Map(results.flatMap(result=>result.sessions instanceof Map?[...result.sessions]:Object.entries(result.sessions)));
 return {panels:results.flatMap(result=>result.panels),getSession:id=>sessions.get(id)};
}
