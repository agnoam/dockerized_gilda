
import { Document } from "mongoose";
import { IGig } from "../interfaces/IGig";

export interface IGigModel extends IGig, Document {
  //custom methods for your model would be defined here
}
