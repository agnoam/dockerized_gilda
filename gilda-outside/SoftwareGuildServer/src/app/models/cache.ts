import { Document } from "mongoose";
import {ICache} from '../interfaces/ICache'
export interface ICacheModel extends ICache, Document {
  //custom methods for your model would be defined here
}
