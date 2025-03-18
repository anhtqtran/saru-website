import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { InventorymanagementComponent } from './inventorymanagement/inventorymanagement.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductlistComponent } from './productlist/productlist.component';
import { EditproductComponent } from './editproduct/editproduct.component';
import { DonhangListComponent } from './donhang-list/donhang-list.component';
import { DonhangDetailComponent } from './donhang-detail/donhang-detail.component';
import { DonhangCreateComponent } from './donhang-create/donhang-create.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'inventorymanage', component: InventorymanagementComponent },
  {path:'products',component:ProductlistComponent},
  { path: 'edit-product', component: EditproductComponent },
  {path: 'orders', component:DonhangListComponent},
  { path: 'donhang-create', component: DonhangCreateComponent },
  { path: 'donhang-detail/:id', component: DonhangDetailComponent }, 
  {path: 'promotions', component: KhuyenmaiListComponent},
  { path: 'khuyenmai-create', component: KhuyenmaiCreateComponent },
  { path: 'khuyenmai-detail', component: KhuyenmaiDetailComponent },
  {path: 'khuyenmai-detail/:id/:type',component: KhuyenmaiDetailComponent},
];
=======

const routes: Routes = [];
>>>>>>> main

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
<<<<<<< HEAD
export class AppRoutingModule {}
=======
export class AppRoutingModule { }
>>>>>>> main
