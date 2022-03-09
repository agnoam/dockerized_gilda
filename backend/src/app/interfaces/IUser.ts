export interface IUser {
    email: string;
    name: string;
    gitlab_user_id: number;
    gitlab_url : string;
    username: string;
    score: number;
    score_detail: string[];
    rank: string;
    avatar_url: string,
    recommended_by : number,
    last_recommendation: Date,
    can_recommend : boolean,
    contributed_projects: number[],
    active: boolean,
    mettermost_user : string,
    bio : string,
    auto_update : boolean,
    skills_langs:string[],
    skills_tags: string[],
    wants_to_learn_tags :string[],
    wants_to_learn_langs : string[],
    badges: {
      gitlab_user: boolean,
      projects : number[],
      snippets : number[],
      pull_requests : {project_id: number, pull_req_id: number}[],
      contributed_pull_requests : {project_id: number, pull_req_id: number}[],
      members_recommended : number[],
      challenges_solved : string[],
      challenges_published : string[],
      projects_shared: number[],      
      }

    approved_data_security_statement?: boolean;
    approved_data_security_statement_date?: Date;

  }
  