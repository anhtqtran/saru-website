import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KhuyenmaiListComponent } from './khuyenmai-list/khuyenmai-list.component';
import { KhuyenmaiCreateComponent } from './khuyenmai-create/khuyenmai-create.component';
import { KhuyenmaiDetailComponent } from './khuyenmai-detail/khuyenmai-detail.component';
const routes: Routes = [
  {path: '', component: KhuyenmaiListComponent},
  { path: 'khuyenmai-create', component: KhuyenmaiCreateComponent },
  { path: 'khuyenmai-detail', component: KhuyenmaiDetailComponent },
  {path: 'khuyenmai-detail/:id/:type',component: KhuyenmaiDetailComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
