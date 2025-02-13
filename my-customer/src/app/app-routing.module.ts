import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';
import { TrangchuSanphamnoibatComponent } from './trangchu-sanphamnoibat/trangchu-sanphamnoibat.component';
import { TrangchuBlogComponent } from './trangchu-blog/trangchu-blog.component';
import { TrangchuFeedbacksComponent } from './trangchu-feedbacks/trangchu-feedbacks.component';

const routes: Routes = [
  { path: 'trangchu-banner-camket/trangchu-banner-camket.component', component: TrangchuBannerCamketComponent },
  { path: 'camketchatluong', component: TrangchuBannerCamketComponent },
  { path: 'sanphamnoibat', component: TrangchuSanphamnoibatComponent },
  { path: 'blog', component: TrangchuBlogComponent },
  { path: 'feedbacks', component: TrangchuFeedbacksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
