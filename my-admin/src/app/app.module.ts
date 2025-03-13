import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

  
registerLocaleData(localeVi, 'vi-VN');
@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    KhuyenmaiDetailComponent,
    KhuyenmaiListComponent,
    BrowserModule,
    AppRoutingModule,
    FormsModule,

    HttpClientModule,

    CommonModule,
    RouterModule,
    HttpClientModule,
    KhuyenmaiCreateComponent,
    HomepageComponent

  ],
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
