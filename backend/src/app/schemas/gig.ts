import { Schema } from "mongoose";

export var gigSchema: Schema = new Schema({

    project_id : Number,
    issue_id: Number,  
    publisher : Number,
    level :Number,
    time_estimate : Number,
});

