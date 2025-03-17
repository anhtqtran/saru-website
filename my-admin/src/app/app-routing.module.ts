import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';
import { CategoriesComponent } from './allblog/categories/categories.component';
import { CategoryFormComponent } from './allblog/category-form/category-form.component';
import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { FaqdetailComponent } from './allfaq/faqdetail/faqdetail.component';
import { FaqlistComponent } from './allfaq/faqlist/faqlist.component';
import { CustomerlistComponent } from './allcustomer/customerlist/customerlist.component';
import { CustomerdetailComponent } from './allcustomer/customerdetail/customerdetail.component';
import { ConsultantComponent } from './consultant/consultant.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'inventorymanage', component: InventorymanagementComponent },
  {path:'admin/products',component:ProductlistComponent},
  { path: 'edit-product', component: EditproductComponent },

  {path: 'admin/orders', component:DonhangListComponent},
  { path: 'donhang-create', component: DonhangCreateComponent },
  { path: 'donhang-detail/:id', component: DonhangDetailComponent }, 
  {path: 'promotions', component: KhuyenmaiListComponent},
  { path: 'khuyenmai-create', component: KhuyenmaiCreateComponent },
  { path: 'khuyenmai-detail', component: KhuyenmaiDetailComponent },
  {path: 'khuyenmai-detail/:id/:type',component: KhuyenmaiDetailComponent},

  { 
    path: 'admin/faqs', 
    component: FaqlistComponent 
  }, // Route cho trang FAQ
  { 
    path: 'admin/faqs/add', 
    component: FaqdetailComponent 
  },
  {
    path:"admin/faqs/:id",
    component:FaqdetailComponent,
  },
  { path: 'admin/consultant', component: ConsultantComponent},
  {
    path:'admin/blogs',
    component:BloglistComponent,
  },
  {
    path:"admin/blogs/add",
    component:BlogdetailComponent,
  },
  {
    path:"admin/blogs/:id",
    component:BlogdetailComponent,
  },
  {
    path:'admin/categories-blog',
    component:CategoriesComponent,
  },
  {
    path:"admin/categories-blog/add",
    component:CategoryFormComponent,
  },
  {
    path:"admin/categories-blog/:id",
    component:CategoryFormComponent,
  },
  {
    path:'admin/customers',
    component:CustomerlistComponent,
  },
  {
    path:"admin/customers/add",
    component:CustomerdetailComponent,
  },
  {
    path:"admin/customers/:id",
    component:CustomerdetailComponent,
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
