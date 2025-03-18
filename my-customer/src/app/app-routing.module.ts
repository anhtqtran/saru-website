import { NgModule } from '@angular/core';
<<<<<<< HEAD

import { RouterModule, Routes, Scroll } from '@angular/router';
import { PaymentdetailComponent } from './paymentdetail/paymentdetail.component';

=======
import { RouterModule, Routes, Scroll } from '@angular/router';
  
>>>>>>> main
import { TrangchuBannerCamketComponent } from './trangchu-banner-camket/trangchu-banner-camket.component';
import { LoginComponent } from './login/login.component';
import { ResetpassComponent } from './resetpass/resetpass.component'; 
import { SendcodeComponent } from './sendcode/sendcode.component';
import { NewpassComponent } from './newpass/newpass.component';
import { SuccessresetpassComponent } from './successresetpass/successresetpass.component';
import { FeatureIntroComponent } from './feature-intro/feature-intro.component';
import { CommitmentComponent } from './commitment/commitment.component';
import { ContactComponent } from './contact/contact.component';
import { HistoryComponent } from './history/history.component';
import { ProductComponent } from './product/product.component';
import { WritereviewComponent } from './writereview/writereview.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { PaymentsuccessfulComponent } from './paymentsuccessful/paymentsuccessful.component';
<<<<<<< HEAD
=======
import { PaymentdetailComponent } from './paymentdetail/paymentdetail.component';
>>>>>>> main
import { AccountmanageComponent } from './accountmanage/accountmanage.component';
import { CartmanageComponent } from './cartmanage/cartmanage.component';
import { OrderdetailComponent } from './orderdetail/orderdetail.component';
import { OrderhistoryComponent } from './orderhistory/orderhistory.component';
import { ReviewpageComponent } from './reviewpage/reviewpage.component';
import { BlogComponent } from './blog/blog.component';
import { FaqsComponent } from './faqs/faqs.component';
<<<<<<< HEAD

import { CompareComponent } from './compare/compare.component'; 



import { AuthGuard } from './guard/auth.guard'; // Nhập AuthGuard


const routes: Routes = [

=======
import { CompareComponent } from './compare/compare.component'; 

import { AuthGuard } from './guard/auth.guard'; // Nhập AuthGuard
import { BlogdetailComponent } from './blogdetail/blogdetail.component';
import { BlogcategoryComponent } from './blogcategory/blogcategory.component';
import { MessageComponent } from './message/message.component';
import { BlogrssComponent } from './blogrss/blogrss.component';

const routes: Routes = [
>>>>>>> main
  { path: 'login', component: LoginComponent },
  { path: 'resetpass', component: ResetpassComponent},
  { path: 'sendcode', component: SendcodeComponent },
  { path: 'newpass', component: NewpassComponent},
  { path: 'successresetpass', component: SuccessresetpassComponent},
  { path: 'intro', component: FeatureIntroComponent},
  { path: 'commitment', component: CommitmentComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'history', component: HistoryComponent},
<<<<<<< HEAD


  { path: 'product', component: ProductComponent},

  { path: 'account', component: AccountmanageComponent, canActivate:[AuthGuard]},
  { path: 'cart', component: CartmanageComponent},
  { path: 'orderdetail', component: OrderdetailComponent},
  { path: 'order-history', component: OrderhistoryComponent, canActivate:[AuthGuard]},
  { path: 'review', component: ReviewpageComponent},
  { path: 'blog', component: BlogComponent},
  { path: 'faqs', component: FaqsComponent},

=======
  { path: 'account', component: AccountmanageComponent, canActivate:[AuthGuard]},
  { path: 'cart', component: CartmanageComponent},
  { path: 'order-detail', component: OrderdetailComponent, canActivate:[AuthGuard]},
  { path: 'order-history', component: OrderhistoryComponent, canActivate:[AuthGuard]},
  { path: 'review', component: ReviewpageComponent},
  { path: 'blog', component: BlogComponent},
  { path: 'blog/:id', component: BlogdetailComponent },
  { path: 'category/:id', component: BlogcategoryComponent },
  { path: 'blogrss', component: BlogrssComponent },
  { path: 'faqs', component: FaqsComponent},
  { path: 'boxchat', component: MessageComponent},
>>>>>>> main
  { path: '', redirectTo: '/homepage', pathMatch: 'full' }, // Route mặc định
  { path: 'product', component: ProductComponent }, // Route cho danh sách sản phẩm
  { 
    path: 'products/:id', 
    component: ProductDetailComponent 
  }, // Route cho chi tiết sản phẩm
  { path: 'homepage', component: TrangchuBannerCamketComponent },
  // Redirect từ path rỗng hoặc root
  { 
    path: '', 
    redirectTo: 'homepage', 
    pathMatch: 'full' 
  },
  { path: 'compare', component: CompareComponent},
<<<<<<< HEAD



  {
    path: '',
    redirectTo: '/homepage',
    pathMatch: 'full',
  },
  { path: 'homepage', component: TrangchuBannerCamketComponent },
  { path: 'trangchu-banner-camket/trangchu-banner-camket.component', component: TrangchuBannerCamketComponent },
=======
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'account', component: AccountmanageComponent, canActivate:[AuthGuard]},
  { path: 'cart', component: CartmanageComponent},
  { path: 'orderdetail', component: OrderdetailComponent},
  { path: 'order-history', component: OrderhistoryComponent, canActivate:[AuthGuard]},
  { path: 'review', component: ReviewpageComponent},
  { path: 'blog', component: BlogComponent},
  { path: 'faqs', component: FaqsComponent},
>>>>>>> main
  { path: 'paymentdetail', component: PaymentdetailComponent }, // Thêm route cho trang thanh toán
  // { path: '**', redirectTo: 'cart' }, // Mặc định chuyển về giỏ hàng nếu đường dẫn không tồn tại
  { path: 'paymentsuccessful', component: PaymentsuccessfulComponent },
  { path: 'writereview', component: WritereviewComponent }
<<<<<<< HEAD




];
  
=======
];
>>>>>>> main

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top', // Tự động cuộn lên đầu
    anchorScrolling: 'enabled'        // Tùy chọn cho anchor links
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
