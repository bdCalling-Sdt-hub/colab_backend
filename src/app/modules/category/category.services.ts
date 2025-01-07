import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICategory, ISubCategory } from './category.interface';
import Category, { SubCategory } from './category.model';
import mongoose from 'mongoose';

// create category into db
const createCategoryIntoDB = async (payload: ICategory) => {
  const result = await Category.create(payload);
  return result;
};

const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<ICategory>,
) => {
  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find();
  return result;
};

const getSingleCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return category;
};
// delete category
const deleteCategoryFromDB = async (categoryId: string) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId, {
      session,
    });

    if (!deletedCategory) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Category not found or does not belong to this shop',
      );
    }

    // await Service.deleteMany({ category: categoryId }, { session });

    await session.commitTransaction();
    session.endSession();

    return deletedCategory;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof mongoose.Error) {
      throw new AppError(500, `Mongoose Error: ${error.message}`);
    }
  }
};

// sub category -----------------------------------------------------------

const createSubCategoryIntoDB = async (
  shopId: string,
  payload: ISubCategory,
) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const result = await SubCategory.create({ ...payload, shop: shopId });
  return result;
};

const updateSubCategoryIntoDB = async (
  shopId: string,
  id: string,
  payload: Partial<ISubCategory>,
) => {
  if (payload?.category) {
    const category = await Category.findById(payload.category);
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
  }
  const result = await SubCategory.findOneAndUpdate(
    { _id: id, shop: shopId },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const getMySubCategoriesFromDB = async (profileId: string) => {
  const result = await SubCategory.find({ shop: profileId }).populate(
    'category',
  );
  return result;
};

const deleteSubCategoryFromDB = async (shopId: string, id: string) => {
  const result = await SubCategory.findOneAndDelete({ _id: id, shop: shopId });
  return result;
};

const categoryService = {
  createCategoryIntoDB,
  updateCategoryIntoDB,
  getAllCategories,
  getSingleCategory,
  createSubCategoryIntoDB,
  updateSubCategoryIntoDB,
  deleteCategoryFromDB,
  getMySubCategoriesFromDB,
  deleteSubCategoryFromDB,
};

export default categoryService;
