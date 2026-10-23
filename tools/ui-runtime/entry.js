export {createElement, useLayoutEffect, useEffect, useState, useRef, Fragment} from 'react';
export {createRoot} from 'react-dom/client';
export {flushSync, createPortal} from 'react-dom';
export {animate} from 'motion/mini';
export {MotionConfig, useAnimationControls} from 'motion/react';
export {AnimateUIProvider} from '@animate-ui/react/provider';
export {Button as AnimateButton} from '@animate-ui/react/primitives/buttons/button';
export {Collapsible} from '@animate-ui/react/primitives/base-ui/collapsible';
export {Tabs} from '@animate-ui/react/primitives/base-ui/tabs';
export {Checkbox} from '@animate-ui/react/primitives/base-ui/checkbox';
export {Select as AnimateSelect} from '@animate-ui/react/primitives/base-ui/select';
export {Effect as AnimateEffect} from '@animate-ui/react/primitives/effects/effect';
export {motionTokens, toCssTiming} from '@animate-ui/react/utils/motion';
// The same upstream hover scope used by Sidebar, menu triggers and controls.
export {TriggerHighlightScope, useTriggerHighlight} from './node_modules/@animate-ui/react/dist/internal/item-highlight.js';
export {animate as animateDOM} from 'motion';
// Pinned upstream Dialog/Sheet choreography, reused by the native top-layer
// adapter so the browser remains the single modal focus/inert owner.
export {getContentTargets as dialogMotionTargets} from './node_modules/@animate-ui/react/dist/internal/modal-motion.js';

