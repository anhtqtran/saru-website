import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResetpassComponent } from './resetpass/resetpass.component'; 
import { SendcodeComponent } from './sendcode/sendcode.component';
import { NewpassComponent } from './newpass/newpass.component';
import { SuccessresetpassComponent } from './successresetpass/successresetpass.component';
import { FeatureIntroComponent } from './feature-intro/feature-intro.component';
import { CommitmentComponent } from './commitment/commitment.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'resetpass', component: ResetpassComponent},
  { path: 'sendcode', component: SendcodeComponent },
  { path: 'newpass', component: NewpassComponent},
  { path: 'successresetpass', component: SuccessresetpassComponent},
  { path: 'intro', component: FeatureIntroComponent},
  { path: 'commitment', component: CommitmentComponent},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
