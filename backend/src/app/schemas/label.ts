import { Schema } from "mongoose";

export var labelSchema: Schema = new Schema({   
    name: String,
    description: String,
    count : Number
});

labelSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
