import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DonhangListComponent } from './donhang-list/donhang-list.component';
import { CommonModule } from '@angular/common';
import { DonhangCreateComponent } from './donhang-create/donhang-create.component';
import { DonhangDetailComponent } from './donhang-detail/donhang-detail.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    RouterModule,
    DonhangDetailComponent,
    DonhangCreateComponent,
    HttpClientModule,
    CurrencyPipe
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
