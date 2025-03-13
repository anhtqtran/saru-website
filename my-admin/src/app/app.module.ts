import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    KhuyenmaiCreateComponent

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
