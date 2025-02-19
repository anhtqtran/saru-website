import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Thêm dòng này


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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


@NgModule({
  declarations: [
    AppComponent,
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule 
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
