// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideAnimations(), // BrowserAnimationsModule as a provider
    provideToastr({
      positionClass: 'toast-bottom-left', // Bottom-left corner
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      preventDuplicates: true,
    }),
  ],
}).catch((err) => console.error(err));
