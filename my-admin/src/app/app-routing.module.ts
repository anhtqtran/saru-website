import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonhangListComponent } from './donhang-list/donhang-list.component';
import { DonhangCreateComponent } from './donhang-create/donhang-create.component';
import { DonhangDetailComponent } from './donhang-detail/donhang-detail.component';

const routes: Routes = [
  { path: '', component: DonhangListComponent },
  { path: 'donhang-detail/:id', component: DonhangDetailComponent },
  { path: 'donhang-create', component: DonhangCreateComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
