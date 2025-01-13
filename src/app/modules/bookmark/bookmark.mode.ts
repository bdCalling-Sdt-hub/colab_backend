import { model, Schema } from 'mongoose';
import { IBookmark } from './bookmark.interface';

const bookmarkSchema = new Schema<IBookmark>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'NormalUser',
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'NormalUser',
    },
  },
  {
    timestamps: true,
  },
);

const Bookmark = model('ProductBookmark', bookmarkSchema);

export default Bookmark;
