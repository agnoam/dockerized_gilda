import { Schema } from "mongoose";

export var userSchema: Schema = new Schema({
  email: String,
  name: String,
  gitlab_user_id: Number,
  gitlab_url : String,
  username: String,
  score: Number,
  score_detail: [String],
  rank : String,
  avatar_url : String,
  recommended_by : Number,
  last_recommendation: Date,
  can_recommend : Boolean,
  contributed_projects: [Number],
  active: Boolean,
  mettermost_user : String,
  auto_update : Boolean,
    skills_langs: [String],
    skills_tags: [String],
    wants_to_learn_tags : [String],
    wants_to_learn_langs :[String],
  bio : String,
  badges: {
    gitlab_user: Boolean,
    projects : [Number],
    snippets : [Number],
    pull_requests : [{project_id: Number, pull_req_id: Number}],
    contributed_pull_requests : [{project_id: Number, pull_req_id: Number}],
    members_recommended : [Number],
    challenges_solved : [String],
    challenges_published : [String],
    projects_shared : [Number]
  },
  approved_data_security_statement: Boolean,
  approved_data_security_statement_date: Date,  
});

userSchema.pre("save", function(next) {
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});
