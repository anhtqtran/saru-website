import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';
import { TrangchuSanphamnoibatComponent } from './trangchu-sanphamnoibat/trangchu-sanphamnoibat.component';
import { TrangchuBlogComponent } from './trangchu-blog/trangchu-blog.component';
import { TrangchuFeedbacksComponent } from './trangchu-feedbacks/trangchu-feedbacks.component';

@NgModule({
  declarations: [
    AppComponent,
    TrangchuBannerCamketComponent,
    TrangchuSanphamnoibatComponent,
    TrangchuBlogComponent,
    TrangchuFeedbacksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
