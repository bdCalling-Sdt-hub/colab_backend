// /* eslint-disable no-unused-vars */
// import { NextFunction, Request, Response } from 'express';
// import catchAsync from '../utilities/catchasync';
// import AppError from '../error/appError';
// import httpStatus from 'http-status';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../config';
// import { TUserRole } from '../modules/user/user.interface';
// import { User } from '../modules/user/user.model';
// import { USER_ROLE } from '../modules/user/user.constant';
// import NormalUser from '../modules/normalUser/normalUser.model';
// import SuperAdmin from '../modules/superAdmin/superAdmin.model';

// // make costume interface

// const auth = (...requiredRoles: TUserRole[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     // check if the token is sent from client -----
//     const token = req?.headers?.authorization;
//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized 1');
//     }
//     // check if the token is valid-
//     // checking if the given token is valid

//     let decoded;

//     try {
//       decoded = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
//     }
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { id, role, email, username, iat } = decoded;

//     if (!decoded) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
//     }
//     // get the user if that here ---------
//     const user = await User.findById(id);
//     if (!user) {
//       throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
//     }
//     if (user.isDeleted) {
//       throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
//     }
//     if (user.status === 'blocked') {
//       throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
//     }
//     if (!user?.isVerified) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'You are not verified user');
//     }

//     let profileData;
//     if (role === USER_ROLE.user) {
//       profileData = await NormalUser.findOne({ user: id }).select('_id');
//     } else if (role === USER_ROLE.superAdmin) {
//       profileData = await SuperAdmin.findOne({ user: id }).select('_id');
//     }

//     decoded.profileId = profileData?._id;
//     // if (
//     //   user?.passwordChangedAt &&
//     //   (await User.isJWTIssuedBeforePasswordChange(
//     //     user?.passwordChangedAt,
//     //     iat as number,
//     //   ))
//     // ) {
//     //   throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized 2');
//     // }
//     if (requiredRoles && !requiredRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized 3');
//     }
//     // add those properties in req
//     req.user = decoded as JwtPayload;
//     next();
//   });
// };

// export default auth;

import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utilities/catchasync';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { USER_ROLE } from '../modules/user/user.constant';
import NormalUser from '../modules/normalUser/normalUser.model';
import SuperAdmin from '../modules/superAdmin/superAdmin.model';

// Helper function to fetch profile data based on role
const getProfileByRole = async (role: string, userId: string) => {
  if (role === USER_ROLE.user) {
    return NormalUser.findOne({ user: userId }).select('_id');
  } else if (role === USER_ROLE.superAdmin) {
    return SuperAdmin.findOne({ user: userId }).select('_id');
  }
  return null;
};

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }

    const { id, role } = decoded;

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }

    // Fetch user and profile data in parallel using Promise.all
    const userPromise = User.findById(id).select('isVerified status isDeleted');
    const profilePromise = getProfileByRole(role, id);

    // Wait for both user and profile data
    const [user, profileData] = await Promise.all([
      userPromise,
      profilePromise,
    ]);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }

    if (user.isDeleted || user.status === 'blocked' || !user.isVerified) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'User is either deleted, blocked, or not verified',
      );
    }

    if (!profileData) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Unauthorized, user profile not found',
      );
    }

    decoded.profileId = profileData._id;
    req.user = decoded as JwtPayload;

    // Check if the user has required roles
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    next();
  });
};

export default auth;
