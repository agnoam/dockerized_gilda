import { IMonsterModel } from './monster';
import { IMeetupModel } from './meetup';
import { IChallengeModel } from './challenge';
import { Model } from "mongoose";
import { IUserModel } from "./user";
import { ICacheModel } from "./cache";
import { IProjectModel } from './project';
import { ILabelModel } from './label';
import { IGigModel } from './gig';

// The application's main DB model
export interface IModel {
  user: Model<IUserModel>;
  challenge : Model<IChallengeModel>;
  meetup : Model<IMeetupModel>;
  monster :Model<IMonsterModel>;
  cache: Model<ICacheModel>;
  project : Model<IProjectModel>;
  label: Model<ILabelModel>;
  gig: Model<IGigModel>;
  connection_string : string;
}