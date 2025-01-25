import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapsPageComponent } from './maps-page/maps-page.component';
import { HomepageComponent } from './homepage/homepage.component';


const routes: Routes = [
  { path: 'maps', component: MapsPageComponent },
  { path: '', component: HomepageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
