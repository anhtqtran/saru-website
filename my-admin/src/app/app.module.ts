import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterLink, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';

import { InventorymanagementComponent } from './inventorymanagement/inventorymanagement.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductlistComponent } from './productlist/productlist.component'; 
import { EditproductComponent } from './editproduct/editproduct.component';

import { DonhangDetailComponent } from './donhang-detail/donhang-detail.component';
import { DonhangCreateComponent } from './donhang-create/donhang-create.component';
import { DonhangListComponent } from './donhang-list/donhang-list.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';

import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';
import { CategoriesComponent } from './allblog/categories/categories.component';
import { CategoryFormComponent } from './allblog/category-form/category-form.component';
import { CustomerlistComponent } from './allcustomer/customerlist/customerlist.component';
import { CustomerdetailComponent } from './allcustomer/customerdetail/customerdetail.component';
import { FaqlistComponent } from './allfaq/faqlist/faqlist.component';
import { FaqdetailComponent } from './allfaq/faqdetail/faqdetail.component';
import { ConsultantComponent } from './consultant/consultant.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    InventorymanagementComponent,
    ProductlistComponent,
    EditproductComponent,


    BloglistComponent,
    BlogdetailComponent,
    CategoriesComponent,
    CategoryFormComponent,
    CustomerlistComponent,
    CustomerdetailComponent,
    FaqlistComponent,
    FaqdetailComponent,
    ConsultantComponent
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

    
    DonhangListComponent,
    DonhangCreateComponent,
    DonhangDetailComponent,

    KhuyenmaiDetailComponent,
    KhuyenmaiListComponent,
    KhuyenmaiListComponent

    ReactiveFormsModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatDatepickerModule, 
    MatNativeDateModule,
    MatIconModule,
    QuillModule.forRoot({
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'], // Chữ đậm, nghiêng, gạch chân, gạch ngang
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Tiêu đề (H1-H6)
          [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Danh sách số & chấm
          [{ 'align': [] }], // Căn chỉnh văn bản
          ['link', 'image', 'video'], // Chèn link, ảnh, video
          ['clean'] // Xóa định dạng
        ]
      }
    })
>>>>>>> newadmin-main-tuvy
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
