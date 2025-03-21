import { model, Schema } from "mongoose";

const FileSchema = new Schema(
  {
    extension:{
      type:String,
      trim:true,
      required:[true,'extension is required']
    },
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
  },
  { timestamps: true, strict: "throw" }
);

export const File = model("File", FileSchema);
