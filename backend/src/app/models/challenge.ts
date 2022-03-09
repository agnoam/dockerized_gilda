
import { Document } from "mongoose";
import { IChallenge } from "../interfaces/IChallenge";

export interface IChallengeModel extends IChallenge, Document {
  //custom methods for your model would be defined here
}
