export enum Action{
  gitlab_user = "Gitlab User Created",
  set_avatar = "Avatar Personalized",
  add_project = "Gitlab Projects",
  solve_challange = "Challenges Solved" ,
  pull_request = "Pull Requests",
  recommend_applicant = "Applicants Recommended",
  contribute_code = "Projects Contributed",
  share_code = "Projects Shared",
  mattermost_user = "Mattermost User Created",
  publish_gig = "Gigs Published",
  gitlab_bio = "Bio Filled",
  user_skill_tags = "User Expertise Tags",
  user_fields_of_interest_tags = "User Fields of Interest Tags",
  user_skill_langs = "User Expertise Languages",
  user_fields_of_interest_langs = "User Fields of Interest Languages"

}

export interface IMonster {   
    name: string,
    description: string,
    parent: number,
    rank: string,
    monster_index: string
    monster_adoption_criteria : [{action : Action, count : number, completion: number}],
    adoption_applicants : [number]
  }
  
 