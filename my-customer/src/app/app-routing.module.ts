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
import { BlogComponent } from './blog/blog.component';
import { ProductComponent } from './product/product.component';


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
  { path: 'blog', component: BlogComponent},
  { path: 'product', component: ProductComponent},



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
