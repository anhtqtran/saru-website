import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Thêm dòng này
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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



@NgModule({
  declarations: [
    AppComponent,
    
    OrderdetailComponent,
    OrderhistoryComponent,

    WritereviewComponent,
    ReviewpageComponent,
    
    CartmanageComponent,
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

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule 
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
