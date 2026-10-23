// Composition only. Each form owns its inputs; form.js owns cancellation and
// result leases, while pure domain models never import the view layer.
import {mountDates} from './date-view.js';
import {mountGeometry,mountBMI} from './geometry-view.js';
import {mountDistance} from './distance-view.js';
import {mountCountdown,mountMeeting} from './time-view.js';
export function mountPractical(main){mountDates(main);mountGeometry(main);mountBMI(main);mountDistance(main);mountCountdown(main);mountMeeting(main);}
