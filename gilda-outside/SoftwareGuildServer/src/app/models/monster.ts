import { Document } from "mongoose";
import { IMonster } from "../interfaces/IMonster";

export interface IMonsterModel extends IMonster, Document {
  //custom methods for your model would be defined here
}
