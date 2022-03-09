
import { Document } from "mongoose";
import {IProject} from "../interfaces/IProject";

export interface IProjectModel extends IProject, Document {
  //custom methods for your model would be defined here
}
