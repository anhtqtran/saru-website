import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< HEAD
import { AppRoutingModule } from './app-routing.module'; // ✅ Import routes
import { AppComponent } from './app.component';
import { InventorymanagementComponent } from './inventorymanagement/inventorymanagement.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductlistComponent } from './productlist/productlist.component'; 
import { EditproductComponent } from './editproduct/editproduct.component';
import { DonhangDetailComponent } from './donhang-detail/donhang-detail.component';
import { DonhangCreateComponent } from './donhang-create/donhang-create.component';
import { DonhangListComponent } from './donhang-list/donhang-list.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    InventorymanagementComponent,
    ProductlistComponent,
    EditproductComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // ✅ Đảm bảo module định tuyến được import
    
    HttpClientModule,
    CommonModule,
    FormsModule,
    
    DonhangListComponent,
    DonhangCreateComponent,
    DonhangDetailComponent,

    KhuyenmaiDetailComponent,
    KhuyenmaiListComponent,
    KhuyenmaiListComponent
=======
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
  

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
>>>>>>> main
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
