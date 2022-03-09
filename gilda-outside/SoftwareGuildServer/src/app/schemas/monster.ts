import { Schema } from "mongoose";

export var monsterSchema: Schema = new Schema({
   
    name: String,
    description: String,
    parent: Number,//gitlab_user_id
    rank: String,
    monster_index: String,
    monster_adoption_criteria : [{action : String, count : Number, completion: Number}],
    adoption_applicants: [Number]
    },{usePushEach:true}
    );

monsterSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
