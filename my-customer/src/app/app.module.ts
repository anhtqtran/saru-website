import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
<<<<<<< HEAD
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
=======
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Thêm dòng này
import { RouterModule } from '@angular/router';
>>>>>>> main
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Đảm bảo đã import BrowserAnimationsModule
import { ToastrModule } from 'ngx-toastr';
<<<<<<< HEAD




import { WritereviewComponent } from './writereview/writereview.component';

import { EmptycartComponent } from './emptycart/emptycart.component';


import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';

import { LoginComponent } from './login/login.component';
import { ResetpassComponent } from './resetpass/resetpass.component'; 
import { SendcodeComponent } from './sendcode/sendcode.component';
import { NewpassComponent } from './newpass/newpass.component';
import { SuccessresetpassComponent } from './successresetpass/successresetpass.component';
import { FeatureIntroComponent } from './feature-intro/feature-intro.component';
import { CommitmentComponent } from './commitment/commitment.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import { BlogdetailComponent } from './blogdetail/blogdetail.component';

import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CompareComponent } from './compare/compare.component';
import { PaymentsuccessfulComponent } from './paymentsuccessful/paymentsuccessful.component';
import { ContactComponent } from './contact/contact.component';
import { HistoryComponent } from './history/history.component';
import { ProductComponent } from './product/product.component';
import { AccountmanageComponent } from './accountmanage/accountmanage.component';
import { CartmanageComponent } from './cartmanage/cartmanage.component';
import { OrderdetailComponent } from './orderdetail/orderdetail.component';
import { OrderhistoryComponent } from './orderhistory/orderhistory.component';
import { ReviewpageComponent } from './reviewpage/reviewpage.component';
import { BlogComponent } from './blog/blog.component';
import { FaqsComponent } from './faqs/faqs.component';


import { AuthGuard } from './guard/auth.guard'; // Nhập AuthGuard

=======
import { LightboxModule } from 'ngx-lightbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';

import { OrderdetailComponent } from './orderdetail/orderdetail.component';
import { OrderhistoryComponent } from './orderhistory/orderhistory.component';

import { WritereviewComponent } from './writereview/writereview.component';
import { ReviewpageComponent } from './reviewpage/reviewpage.component';

import { CartmanageComponent } from './cartmanage/cartmanage.component';
import { EmptycartComponent } from './emptycart/emptycart.component';

import { AccountmanageComponent } from './accountmanage/accountmanage.component';
import { LoginComponent } from './login/login.component';
import { ResetpassComponent } from './resetpass/resetpass.component';
import { SendcodeComponent } from './sendcode/sendcode.component';
import { NewpassComponent } from './newpass/newpass.component';
import { SuccessresetpassComponent } from './successresetpass/successresetpass.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FeatureIntroComponent } from './feature-intro/feature-intro.component';
import { HistoryComponent } from './history/history.component';
import { ContactComponent } from './contact/contact.component';
import { CommitmentComponent } from './commitment/commitment.component';
import { ProductComponent } from './product/product.component';
import { BlogComponent } from './blog/blog.component';
import { BlogdetailComponent } from './blogdetail/blogdetail.component';
import { FaqsComponent } from './faqs/faqs.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CompareComponent } from './compare/compare.component';
import { BlogcategoryComponent } from './blogcategory/blogcategory.component';
import { MessageComponent } from './message/message.component';
import { PaymentdetailComponent } from './paymentdetail/paymentdetail.component';
import { PaymentsuccessfulComponent } from './paymentsuccessful/paymentsuccessful.component';
import { BlogrssComponent } from './blogrss/blogrss.component';
import { EmojiPipe } from './pipe/emoji.pipe';


>>>>>>> main

@NgModule({
  declarations: [
    AppComponent,

    TrangchuBannerCamketComponent,
<<<<<<< HEAD
    
=======
>>>>>>> main

    OrderdetailComponent,
    OrderhistoryComponent,

<<<<<<< HEAD
    
    ReviewpageComponent,
    
    
=======
    WritereviewComponent,
    ReviewpageComponent,
    
    CartmanageComponent,
>>>>>>> main
    EmptycartComponent,

    AccountmanageComponent,
    LoginComponent,
    ResetpassComponent,
    SendcodeComponent,
    NewpassComponent,
    SuccessresetpassComponent,
    HeaderComponent,
    FooterComponent,
    FeatureIntroComponent,
    HistoryComponent,
    ContactComponent,
    CommitmentComponent,
    ProductComponent,
    BlogComponent,
    BlogdetailComponent,
    FaqsComponent,
    ProductDetailComponent,
    CompareComponent,
<<<<<<< HEAD
    

=======
    BlogcategoryComponent,
    MessageComponent,
    PaymentdetailComponent,
    PaymentsuccessfulComponent,
    BlogrssComponent,
>>>>>>> main
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
<<<<<<< HEAD

=======
>>>>>>> main
    FormsModule,
    RouterModule ,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatToolbarModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
<<<<<<< HEAD
=======
    LightboxModule,
>>>>>>> main
    ToastrModule.forRoot({   // Cấu hình Toastr
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true
    }),
<<<<<<< HEAD

    FormsModule,
    WritereviewComponent,
    CartmanageComponent,
    MatProgressSpinnerModule,
    PaymentsuccessfulComponent

    
  ],
  
  providers: [],
=======
    EmojiPipe
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
>>>>>>> main
  bootstrap: [AppComponent]
})
export class AppModule { }
