import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    AppRoutingModule, 
    // provideAnimationsAsync(),
    provideHttpClient(),
],
};