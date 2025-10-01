import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; 
import { Provider } from '@angular/core';
import { EMPLOYMENT_CHANGES_PORT, EmploymentChangesPort } from './services/employment-changes.port';
import { LocalEmploymentChangesService } from './services/local-employment-changes.service';

import { routes } from './app.routes';

function provide(token: InjectionToken<any>, options: { useExisting: any }): Provider {
  return {
    provide: token,
    useExisting: options.useExisting
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), 
    provide(EMPLOYMENT_CHANGES_PORT, { useExisting: LocalEmploymentChangesService }),
  ]
};
// تسجيل LocalEmploymentChangesService كمزود لخدمة EMPLOYMENT_CHANGES_PORT
// لتسهيل تبديلها لاحقاً بخدمة أخرى (مثلاً باكند حقيقي)