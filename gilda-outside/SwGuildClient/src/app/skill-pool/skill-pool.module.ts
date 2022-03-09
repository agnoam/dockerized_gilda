import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { MarkdownModule } from 'ngx-markdown';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatTabsModule,
  MatIconModule,
  MatInputModule,
  MatDialogModule
} from '@angular/material';

import { DataScrollerModule } from 'primeng/datascroller';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CarouselModule } from 'primeng/carousel';

import { SkillPoolComponent } from './skill-pool.component';
import { LabelsCloudComponent } from './components/labels-cloud/labels-cloud.component';
import { FilterComponent } from './components/filter/filter.component';
import { ProjectsTabComponent } from './components/projects-tab/projects-tab.component';
import { GigsTabComponent } from './components/gigs-tab/gigs-tab.component';
import { PeopleTabComponent } from './components/people-tab/people-tab.component';
import { UserProfilComponent } from './components/user-profil/user-profil.component';

import { AddLabelsComponent } from './components/popupWindows/components/add-labels/add-labels.component';
import { ExpandedProjectDetailsComponent } from './components/popupWindows/components/expanded-project-details/expanded-project-details.component';
import { ProjectItemComponent } from './components/projects-tab/project-item/project-item.component';
import { PersonItemComponent } from './components/people-tab/person-item/person-item.component';
import { GigItemComponent } from './components/gigs-tab/gig-item/gig-item.component';
import { NewGigComponent } from './components/popupWindows/components/new-gig/new-gig.component';
import { PeoplePopupComponent } from './components/popupWindows/components/people-popup/people-popup.component';
import { ConfirmDialogComponent } from './components/popupWindows/components/confirm-dialog/confirm-dialog.component';
import { ProjectMinComponent } from './components/project-min/project-min.component';
import { LanguagePopupComponent } from './components/popupWindows/components/language-popup/language-popup.component';
import { ExpandedPersonDetailsComponent } from './components/popupWindows/components/expanded-person-details/expanded-person-details.component';
import { ExpandedGigDetailsComponent } from './components/popupWindows/components/expanded-gig-details/expanded-gig-details.component';
import { PersonImageForExpandingComponent } from './components/person-image-for-expanding/person-image-for-expanding.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    //material
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTabsModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    //primeng
    DataScrollerModule,
    OverlayPanelModule,
    AutoCompleteModule,
    ButtonModule,
    DropdownModule,
    CarouselModule,
    MarkdownModule.forChild()
  ],
  declarations: [
    SkillPoolComponent,
    AddLabelsComponent,
    LabelsCloudComponent,
    FilterComponent,
    ProjectsTabComponent,
    GigsTabComponent,
    PeopleTabComponent,
    UserProfilComponent,
    ExpandedProjectDetailsComponent,
    ProjectItemComponent,
    PersonItemComponent,
    GigItemComponent,
    NewGigComponent,
    PeoplePopupComponent,
    ConfirmDialogComponent,
    ProjectMinComponent,
    LanguagePopupComponent,
    ExpandedPersonDetailsComponent,
    ExpandedGigDetailsComponent,
    PersonImageForExpandingComponent
  ],
  entryComponents: [
    ExpandedProjectDetailsComponent,
    PeoplePopupComponent,
    NewGigComponent,
    ConfirmDialogComponent,
    LanguagePopupComponent,
    ExpandedPersonDetailsComponent,
    ExpandedGigDetailsComponent],
  exports: [SkillPoolComponent]
})
export class SkillPoolModule { }
