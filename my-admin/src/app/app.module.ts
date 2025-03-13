import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'; // ✅ Import routes
import { AppComponent } from './app.component';
import { InventorymanagementComponent } from './inventorymanagement/inventorymanagement.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductlistComponent } from './productlist/productlist.component'; 
import { EditproductComponent } from './editproduct/editproduct.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    InventorymanagementComponent,
    ProductlistComponent,
    EditproductComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // ✅ Đảm bảo module định tuyến được import
    
    HttpClientModule,
    CommonModule,
    FormsModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
