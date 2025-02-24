import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FaqComponent } from './faq/faq.component';
import { FaqCreateComponent } from './faq-create/faq-create.component';
// import { ProductsComponent } from './products/products.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ConsultantComponent } from './consultant/consultant.component';
import { RouterLink, RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { BlogComponent } from './blog/blog.component';
import { DemoComponent } from './demo/demo.component';
import { BlogCreateComponent } from './blog-create/blog-create.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';

@NgModule({
  declarations: [
    AppComponent,
    FaqComponent,
    FaqCreateComponent,
    // ProductsComponent,
    ProductFormComponent,
    ConsultantComponent,
    CategoriesComponent,
    CategoryFormComponent,
    BlogComponent,
    DemoComponent,
    BlogCreateComponent,
    CustomerComponent,
    CustomerDetailComponent,
    BloglistComponent,
    BlogdetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatButtonModule,
    RouterLink,
    FormsModule,
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }