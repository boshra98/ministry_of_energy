// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { App } from './app/app';

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
// import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

const extraConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),        // للـ Datepicker/Overlays
    provideNativeDateAdapter(), // مزوّد التاريخ (بديل عن MatNativeDateModule)
  ],
};

bootstrapApplication(
  App,
  mergeApplicationConfig(appConfig, extraConfig)
).catch(err => console.error(err));
