import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';

const routes: Routes = [
  { path: 'trangchu-banner-camket/trangchu-banner-camket.component', component: TrangchuBannerCamketComponent },
  { path: 'camketchatluong', component: TrangchuBannerCamketComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
