import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';
import { CategoriesComponent } from './allblog/categories/categories.component';
import { CategoryFormComponent } from './allblog/category-form/category-form.component';
import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { FaqdetailComponent } from './allfaq/faqdetail/faqdetail.component';
import { FaqlistComponent } from './allfaq/faqlist/faqlist.component';
import { CustomerlistComponent } from './allcustomer/customerlist/customerlist.component';
import { CustomerdetailComponent } from './allcustomer/customerdetail/customerdetail.component';
import { ConsultantMessageComponent } from './consultant-message/consultant-message.component';

const routes: Routes = [
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
  { path: 'consultant', component: ConsultantMessageComponent},
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
export class AppRoutingModule { }