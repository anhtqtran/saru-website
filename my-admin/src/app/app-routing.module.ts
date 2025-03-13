import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventorymanagementComponent } from './inventorymanagement/inventorymanagement.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductlistComponent } from './productlist/productlist.component';
import { EditproductComponent } from './editproduct/editproduct.component';
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'inventorymanage', component: InventorymanagementComponent },
  {path:'products',component:ProductlistComponent},
  { path: 'edit-product', component: EditproductComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
