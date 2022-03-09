import { Document } from "mongoose";
import { IUser } from "../interfaces/IUser";

export interface IUserModel extends IUser, Document {
  //custom methods for your model would be defined here
}
