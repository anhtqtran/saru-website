import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterLink, RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

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
import { QuillModule } from 'ngx-quill';

import { BloglistComponent } from './allblog/bloglist/bloglist.component';
import { BlogdetailComponent } from './allblog/blogdetail/blogdetail.component';
import { CategoriesComponent } from './allblog/categories/categories.component';
import { CategoryFormComponent } from './allblog/category-form/category-form.component';
import { FaqlistComponent } from './allfaq/faqlist/faqlist.component';
import { FaqdetailComponent } from './allfaq/faqdetail/faqdetail.component';
// import { AllcustomerComponent } from './allcustomer/allcustomer.component';
import { CustomerlistComponent } from './allcustomer/customerlist/customerlist.component';
import { CustomerdetailComponent } from './allcustomer/customerdetail/customerdetail.component';
import { ConsultantMessageComponent } from './consultant-message/consultant-message.component';

@NgModule({
  declarations: [
    AppComponent,
    BloglistComponent,
    BlogdetailComponent,
    FaqlistComponent,
    FaqdetailComponent,
    ConsultantMessageComponent,
    // AllcustomerComponent,
    CustomerlistComponent,
    CustomerdetailComponent,
    CategoriesComponent,
    CategoryFormComponent,
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
    ReactiveFormsModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatDatepickerModule, 
    MatNativeDateModule,
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
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }