export interface IMeetup {
    email: string;
    waiting_list_gitlab_ids: number[];
    attending_list_gitlab_ids: number[];
    subject : string;
    description: string;
    location:string;
    date: Date;
    calendar_ics: string; 
    resources_url: string;   
  }
  