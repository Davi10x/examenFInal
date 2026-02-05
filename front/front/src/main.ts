import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { logOutOutline, addOutline, createOutline, trashOutline, peopleOutline, personCircleOutline, personAddOutline, alertCircleOutline } from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';

addIcons({
  'log-out': logOutOutline,
  'add': addOutline,
  'create': createOutline,
  'trash': trashOutline,
  'people': peopleOutline,
  'person-circle': personCircleOutline,
  'person-add': personAddOutline,
  'alert-circle': alertCircleOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
