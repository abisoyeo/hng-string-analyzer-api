import createError from "http-errors";
import StringModel from "../models/stringModel.js";
import { analyzeString } from "../utils/stringAnalyzer.js";

export async function fetchStringByValue(req, res, next) {
  try {
    const { value } = req.params;

    const analysis = analyzeString(value);

    const result = await StringModel.findOne({
      sha256_hash: analysis.sha256_hash,
    });

    if (!result) {
      return next(createError(404, "Not found"));
    }

    res.status(200).json({
      id: result.sha256_hash,
      value: result.value,
      properties: {
        length: result.length,
        is_palindrome: result.is_palindrome,
        unique_characters: result.unique_characters,
        word_count: result.word_count,
        sha256_hash: result.sha256_hash,
        character_frequency_map: Object.fromEntries(
          result.character_frequency_map
        ),
      },
      created_at: result.created_at,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchStrings(req, res, next) {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    const filtersApplied = {};
    const query = {};

    if (is_palindrome !== undefined) {
      if (is_palindrome === "true" || is_palindrome === true) {
        query.is_palindrome = true;
      } else if (is_palindrome === "false" || is_palindrome === false) {
        query.is_palindrome = false;
      } else {
        return next(createError(400, "is_palindrome must be true or false"));
      }
    }

    if (min_length !== undefined) {
      const minLen = parseInt(min_length);
      if (isNaN(minLen))
        return next(createError(400, "min_length must be a number"));
      query.length = { ...query.length, $gte: minLen };
      filtersApplied.min_length = minLen;
    }

    if (max_length !== undefined) {
      const maxLen = parseInt(max_length);
      if (isNaN(maxLen))
        return next(createError(400, "max_length must be a number"));
      query.length = { ...query.length, $lte: maxLen };
      filtersApplied.max_length = maxLen;
    }

    if (word_count !== undefined) {
      const wc = parseInt(word_count);
      if (isNaN(wc))
        return next(createError(400, "word_count must be a number"));
      query.word_count = wc;
      filtersApplied.word_count = wc;
    }

    if (contains_character !== undefined) {
      if (
        typeof contains_character !== "string" ||
        contains_character.length !== 1
      ) {
        return next(
          createError(400, "contains_character must be a single character")
        );
      }
      query[`character_frequency_map.${contains_character}`] = {
        $exists: true,
      };
      filtersApplied.contains_character = contains_character;
    }

    const stringData = await StringModel.find(query).sort({ created_at: -1 });

    res.status(200).json({
      data: stringData.map((s) => ({
        id: s.sha256_hash,
        value: s.value,
        properties: {
          length: s.length,
          is_palindrome: s.is_palindrome,
          unique_characters: s.unique_characters,
          word_count: s.word_count,
          sha256_hash: s.sha256_hash,
          character_frequency_map: Object.fromEntries(
            s.character_frequency_map
          ),
        },
        created_at: s.created_at,
      })),
      count: stringData.length,
      filters_applied: filtersApplied,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchStringsByNaturalLang(req, res, next) {
  try {
    const { query } = req.query;
    if (!query) return next(createError(400, "query parameter is required"));

    const lowerQuery = query.toLowerCase();
    const parsedFilters = {};

    if (
      lowerQuery.includes("palindromic") ||
      lowerQuery.includes("palindrome")
    ) {
      parsedFilters.is_palindrome = true;
    }

    const wordCountMatch = lowerQuery.match(/(\d+)\s*word/);
    if (wordCountMatch) {
      parsedFilters.word_count = parseInt(wordCountMatch[1]);
    } else if (lowerQuery.includes("single word")) {
      parsedFilters.word_count = 1;
    }

    const minLengthMatch = lowerQuery.match(/longer than (\d+)/);
    if (minLengthMatch)
      parsedFilters.min_length = parseInt(minLengthMatch[1]) + 1;

    const containsMatch = lowerQuery.match(/contain(?:ing)? the letter (\w)/);
    if (containsMatch) parsedFilters.contains_character = containsMatch[1];

    if (
      parsedFilters.min_length &&
      parsedFilters.max_length &&
      parsedFilters.min_length > parsedFilters.max_length
    ) {
      return next(
        createError(422, "Conflicting filters in natural language query")
      );
    }

    req.query = parsedFilters;
    return fetchStrings(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function createString(req, res, next) {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return next(createError(400, '"value" field is required'));
    }
    if (typeof value !== "string") {
      return next(createError(422, '"value" must be a string'));
    }

    const analysis = analyzeString(value);

    const existing = await StringModel.findOne({
      sha256_hash: analysis.sha256_hash,
    });

    if (existing) {
      return next(createError(409, "String already exists"));
    }

    const result = await StringModel.create({
      value: value,
      length: analysis.length,
      is_palindrome: analysis.is_palindrome,
      unique_characters: analysis.unique_characters,
      word_count: analysis.word_count,
      sha256_hash: analysis.sha256_hash,
      character_frequency_map: analysis.character_frequency_map,
    });

    res.status(201).json({
      id: result.sha256_hash,
      value: result.value,
      properties: {
        length: result.length,
        is_palindrome: result.is_palindrome,
        unique_characters: result.unique_characters,
        word_count: result.word_count,
        sha256_hash: result.sha256_hash,
        character_frequency_map: Object.fromEntries(
          result.character_frequency_map
        ),
      },
      created_at: result.created_at,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteString(req, res, next) {
  try {
    const { value } = req.params;

    const analysis = analyzeString(value);

    const result = await StringModel.findOne({
      sha256_hash: analysis.sha256_hash,
    });

    if (!result) {
      return next(createError(404, "Not found"));
    }

    await StringModel.deleteOne({ sha256_hash: analysis.sha256_hash });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
