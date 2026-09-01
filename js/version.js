/**
 * The version of the code actually running.
 *
 * Shown in the footer so "is this device on the current build?" is a fact rather
 * than a guess. The service worker serves a cached shell first, so a device can
 * be running last week's code while this week's sits installed and waiting, and
 * without a number on screen there is no way to tell from the outside.
 *
 * Kept equal to CACHE_VERSION in sw.js; a test fails if the two drift apart.
 */
export const APP_VERSION = 'v2';
