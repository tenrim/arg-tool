import { FUN_TASKS } from './catalog.js';
import { mountText } from './text-page.js';
import { mountImage } from './image-page.js';
import { mountAudio } from './audio-page.js';
import { mountScreen } from './screen-page.js';
export function mountFunTools(host) {
  for (const task of FUN_TASKS) {
    if (host.querySelector('#panel-' + task.id)) continue;
    if (task.id === 'spectral-images') mountAudio(host, task);
    else if (task.id === 'screen-drop') mountScreen(host, task);
    else if (['pic-scramble', 'visual-crypto', 'file-image'].includes(task.id))
      mountImage(host, task);
    else mountText(host, task);
  }
}
