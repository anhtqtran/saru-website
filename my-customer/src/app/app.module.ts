import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WritereviewComponent } from './writereview/writereview.component';
import { ReviewpageComponent } from './reviewpage/reviewpage.component';

@NgModule({
  declarations: [
    AppComponent,
    WritereviewComponent,
    ReviewpageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
