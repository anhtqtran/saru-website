import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CartmanageComponent } from './cartmanage/cartmanage.component';
import { EmptycartComponent } from './emptycart/emptycart.component';

@NgModule({
  declarations: [
    AppComponent,
    CartmanageComponent,
    EmptycartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
