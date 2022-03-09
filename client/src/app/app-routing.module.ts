import { MeetupsCardComponent } from './components/meetups-card/meetups-card.component';
import {LandingComponent} from './components/landing/landing.component'
import { HomePageComponent } from './components/home-page/home-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DevelopYourselfComponent} from './components/develop-yourself/develop-yourself.component'
import {ScoreBoardComponent} from './components/island/components/score-board/score-board.component'
import {AboutGildaComponent} from './components/about-gilda/about-gilda.component'
import {IslandComponent} from './components/island/island.component'
import { AddChallengeComponent } from './components/add-challenge/add-challenge.component';
import { BrowserNotSupportedComponent } from './components/browser-not-supported/browser-not-supported.component';
import { SkillPoolComponent } from './skill-pool/skill-pool.component';
import {AuthGuard} from './auth.guard'

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'develop', component: DevelopYourselfComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'scoreboard', component: IslandComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'about', component: AboutGildaComponent, /*canActivate: [AuthGuard]*/ },
{ path: 'meetup', component: MeetupsCardComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'monster', component: MeetupsCardComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'addchallenge', component: AddChallengeComponent, canActivate: [AuthGuard] },
  { path: 'skillpool', component: SkillPoolComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'homepage', component: HomePageComponent, /*canActivate: [AuthGuard]*/},
  { path: 'browsernotsupported', component: BrowserNotSupportedComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
 exports: [RouterModule],
 imports: [RouterModule.forRoot(routes) ],

})
export class AppRoutingModule {  
 }
