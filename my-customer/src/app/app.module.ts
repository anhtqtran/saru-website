import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrdermanageComponent } from './ordermanage/ordermanage.component';
import { OrderdetailComponent } from './orderdetail/orderdetail.component';
import { OrderhistoryComponent } from './orderhistory/orderhistory.component';

@NgModule({
  declarations: [
    AppComponent,
    OrdermanageComponent,
    OrderdetailComponent,
    OrderhistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
