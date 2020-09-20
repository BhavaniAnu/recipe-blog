import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
   MatInputModule,
   MatCardModule,
   MatButtonModule,
   MatToolbarModule,
   MatExpansionModule,
   MatDialogModule,
   MatProgressSpinnerModule, MatPaginatorModule} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecipeCreateComponent } from './recipes/recipe-create/recipe-create.component';
import { HeaderComponent } from './header/header.component';
import { RecipeListComponent } from './recipes/recipe-list/recipe-list.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { ErrorComponent } from './error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    RecipeCreateComponent,
    HeaderComponent,
    RecipeListComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule { }
