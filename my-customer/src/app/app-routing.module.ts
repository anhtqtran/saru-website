import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { AccountmanageComponent } from './accountmanage/accountmanage.component';
import { CartmanageComponent } from './cartmanage/cartmanage.component';
import { OrderdetailComponent } from './orderdetail/orderdetail.component';
import { OrderhistoryComponent } from './orderhistory/orderhistory.component';
import { ReviewpageComponent } from './reviewpage/reviewpage.component';
import { BlogComponent } from './blog/blog.component';
import { FaqsComponent } from './faqs/faqs.component';

import { AuthGuard } from './guard/auth.guard'; // Nhập AuthGuard


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'resetpass', component: ResetpassComponent},
  { path: 'sendcode', component: SendcodeComponent },
  { path: 'newpass', component: NewpassComponent},
  { path: 'successresetpass', component: SuccessresetpassComponent},
  { path: 'intro', component: FeatureIntroComponent},
  { path: 'commitment', component: CommitmentComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'history', component: HistoryComponent},
  { path: 'product', component: ProductComponent},
  { path: 'account', component: AccountmanageComponent, canActivate:[AuthGuard]},
  { path: 'cart', component: CartmanageComponent},
  { path: 'order-detail', component: OrderdetailComponent, canActivate:[AuthGuard]},
  { path: 'order-history', component: OrderhistoryComponent, canActivate:[AuthGuard]},
  { path: 'review', component: ReviewpageComponent},
  { path: 'blog', component: BlogComponent},
  { path: 'faqs', component: FaqsComponent},
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
