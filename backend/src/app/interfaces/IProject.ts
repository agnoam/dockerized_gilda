export interface IProject {
    project_id : number,
    description : string,
    name : string,
    name_with_namespace : string,
    path : string,
    path_with_namespace :string,
    created_at : Date,
    default_branch : string,
    tag_list : string [] ,
    ssh_url_to_repo : string,
    http_url_to_repo : string,
    web_url : string,
    readme_url : string,
    avatar_url : string,
    star_count : number,
    forks_count : number,
    last_activity_at : Date,
    clones : 
    {
        count : number,
        date : string
    } [],
   
    _links: {
        self : string,
        issues : string,
        merge_requests : string,
        repo_branches : string,
        labels : string,
        events : string,
        members : string
    },
    archived : boolean,
    visibility : string,   
    creator_id : number,
   
    statistics : {
        commit_count : number,
        
    },
   
    files : string[],
    contributors : number[],
    owners : number[],        
    languages : any,
    community : number[], 
      
    potential_developers : number[],
    heartbeat : number
}