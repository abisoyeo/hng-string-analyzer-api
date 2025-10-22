import mongoose from "mongoose";

const stringSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, unique: true, lowercase: true },
    length: { type: Number, required: true },
    is_palindrome: { type: Boolean, required: true },
    unique_characters: { type: Number, required: true },
    word_count: { type: Number, required: true },
    sha256_hash: { type: String, required: true, unique: true },
    character_frequency_map: { type: Map, of: Number, required: true },
  },
  { timestamps: { createdAt: "created_at" } }
);

const StringModel = mongoose.model("Strings", stringSchema);

export default StringModel;
