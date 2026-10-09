// Entry point. Each module owns one piece of behaviour and is started on its own,
// so a failure in one (say, WebGL is unavailable) never stops the others.
import { readPageData, readEnvironment } from './lib/env.js';
import { initSkills } from './modules/skills.js';
import { initBadge } from './modules/badge.js';
import { initHeroVideo } from './modules/hero-video.js';
import { initHeroRoles } from './modules/hero-roles.js';
import { initAccordion } from './modules/accordion.js';
import { initNavigation } from './modules/navigation.js';
import { initCountUp } from './modules/count-up.js';
import { initTimeline } from './modules/timeline.js';
import { initContact } from './modules/contact.js';
import { initResume } from './modules/resume.js';
import { initReveal } from './modules/reveal.js';
import { initTheme } from './modules/theme.js';

const context = { data: readPageData(), ...readEnvironment() };

const modules = [initTheme, initSkills, initBadge, initHeroVideo, initHeroRoles, initAccordion, initNavigation, initCountUp, initTimeline, initContact, initResume, initReveal];

for (const init of modules) {
  try {
    init(context);
  } catch (error) {
    console.error(`${init.name} failed`, error);
  }
}
