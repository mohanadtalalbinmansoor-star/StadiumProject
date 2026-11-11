import { Routes } from '@angular/router';
import { StadiumsComponent } from './stadiums/stadiums';
import { About } from './about/about';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', component: StadiumsComponent }, 
  { path: 'stadiums', component: StadiumsComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact }
];