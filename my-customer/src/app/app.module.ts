import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PaymentdetailComponent } from './paymentdetail/paymentdetail.component';
import { PaymentsuccessfulComponent } from './paymentsuccessful/paymentsuccessful.component';

@NgModule({
  declarations: [
    AppComponent,
    PaymentdetailComponent,
    PaymentsuccessfulComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
