
import { AuthInterceptor } from './services/auth-interceptor.service';

import { ToolbarComponent } from './components/toolbar/toolbar.component';
//import { AppRoutingModule } from './app-routing.module';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NguCarouselModule } from '@ngu/carousel';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './app.component';
import {AuthGuard} from './auth.guard'

import { FlexLayoutModule } from '@angular/flex-layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RoutingService} from './services/routing.service'
import {RoutingExtService} from './services/routing.ext.service'
import {UsersService} from './services/users-service'
import {ChallengesService} from './services/challenges-service'
import {CurrentUserServices} from './services/current-user-service'
import { MeetupService } from './services/meetup.service';
import { RanksService } from './services/ranks.service';
import { MonstersService } from './services/monsters.service';
import {AuthService} from './services/auth.service'

import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
} from '@angular/material';

import {DataScrollerModule} from 'primeng/datascroller';
import {CarouselModule} from 'primeng/carousel';

import 'hammerjs';
import { ScoreBoardComponent } from './components/island/components/score-board/score-board.component';
import { IslandComponent } from './components/island/island.component';
import { MeetupsCardComponent } from './components/meetups-card/meetups-card.component';
import { ChallengeCardComponent } from './components/island/components/challenge-card/challenge-card.component';
import { VirtualKeyboardComponent } from './virtual-keyboard/virtual-keyboard.component';
import { AppRoutingModule } from './app-routing.module';
import { DevelopYourselfComponent } from './components/develop-yourself/develop-yourself.component';
import { AboutGildaComponent } from './components/about-gilda/about-gilda.component';
import { UserScoreComponent } from './components/island/components/user-score/user-score.component';
import { MatGridListModule} from '@angular/material/grid-list';
import { HomePageComponent } from './components/home-page/home-page.component';
import { UserProfilComponent } from './components/island/components/user-profil/user-profil.component';
import { AddChallengeComponent } from './components/add-challenge/add-challenge.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { MonsterCardComponent } from './components/island/components/monster-card/monster-card.component';
import { BrowserNotSupportedComponent } from './components/browser-not-supported/browser-not-supported.component';
import { HelpPageComponent } from './components/help-page/help-page.component';
import { MessagePopupComponent } from './components/message-popup/message-popup.component';
import { SkillPoolModule} from './skill-pool/skill-pool.module';
import { LandingComponent } from './components/landing/landing.component'
import { CookieService } from 'ngx-cookie-service';
import { AvtamComponent } from './components/avtam/avtam.component';

@NgModule({
  declarations: [
    AppComponent,
    //AppRoutingModule,
    ToolbarComponent,
    ScoreBoardComponent,
    IslandComponent,
    MeetupsCardComponent,
    ChallengeCardComponent,
    VirtualKeyboardComponent,
    DevelopYourselfComponent,
    AboutGildaComponent,
    UserScoreComponent,
    HomePageComponent,
    AddChallengeComponent,
    UserProfilComponent,
    PopUpComponent,
    MonsterCardComponent,
    BrowserNotSupportedComponent,
    HelpPageComponent,
    MessagePopupComponent,
    LandingComponent,
    AvtamComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    SkillPoolModule,

    // Material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatNativeDateModule,
    MatGridListModule,
    // Flex-layout
    FlexLayoutModule,

    AppRoutingModule,
    DataScrollerModule,
    NguCarouselModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    AuthGuard,
    RoutingService, 
    RoutingExtService, 
    UsersService, 
    ChallengesService, 
    RanksService, 
    CurrentUserServices, 
    MeetupService,
    CookieService,
    MonstersService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AuthService
  ],
  entryComponents: [MonsterCardComponent, HelpPageComponent, MessagePopupComponent, AvtamComponent],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
