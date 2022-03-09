import { Schema } from "mongoose";

export var cacheSchema: Schema = new Schema(
    {
        contentID: String,
        data: Schema.Types.Mixed
    }, 
    {strict:false}
    );
  

