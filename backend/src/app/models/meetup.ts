
import { Document } from "mongoose";
import { IMeetup } from "../interfaces/IMeetup";

export interface IMeetupModel extends IMeetup, Document {
  //custom methods for your model would be defined here
}
