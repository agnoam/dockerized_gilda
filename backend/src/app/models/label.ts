
import { Document } from "mongoose";
import { ILabel } from "../interfaces/ILabel";

export interface ILabelModel extends ILabel, Document {
  //custom methods for your model would be defined here
}
