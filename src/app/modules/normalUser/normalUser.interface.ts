/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export interface INormalUser {
    user:Types.ObjectId;
    name:string;
    bio:string;
    email:string;
    address?:string;
    profile_image:string;
    mainSkill:string;
    additionalSkills:[string];
    videos:[string];
}