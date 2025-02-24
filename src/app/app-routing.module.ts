import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { FaqCreateComponent } from './faq-create/faq-create.component';
// import { ProductsComponent } from './products/products.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ConsultantComponent } from './consultant/consultant.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryFormComponent } from './category-form/category-form.component';
// import { BlogComponent } from './blog/blog.component';
import { DemoComponent } from './demo/demo.component';
// import { BlogCreateComponent } from './blog-create/blog-create.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';

const routes: Routes = [
  { path: 'faq', component: FaqComponent }, // Route cho trang FAQ
  { path: 'faq-create', component: FaqCreateComponent },
  { path: 'consultant', component: ConsultantComponent},
  { path: 'admin/create new blog', component: BlogdetailComponent},
  { path: 'admin/customer-list', component: CustomerComponent},
  { path: 'admin/customer-detail', component: CustomerDetailComponent},
  // {
  //   path:'admin/products',
  //   component:ProductsComponent,
  // },
  {
    path:"admin/products/add",
    component:ProductFormComponent,
  },
  {
    path:"admin/products/:id",
    component:ProductFormComponent,
  },
  {
    path:'admin/categories',
    component:CategoriesComponent,
  },
  {
    path:"admin/categories/add",
    component:CategoryFormComponent,
  },
  {
    path:"admin/categories/:id",
    component:CategoryFormComponent,
  },
  {
    path:'admin/blog',
    component:BloglistComponent,
  },
  {
    path:'admin/demo',
    component:DemoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }