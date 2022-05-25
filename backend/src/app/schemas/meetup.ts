import { Schema } from "mongoose";

export var meetupSchema: Schema = new Schema({
    email: String,
    waiting_list_gitlab_ids: [Number],
    attending_list_gitlab_ids: [Number],
    subject : String,
    description: String,
    location: String,
    date: Date,
    calendar_ics: String  
});
