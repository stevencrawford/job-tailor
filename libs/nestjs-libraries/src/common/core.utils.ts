// @see https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
export const asyncFilter = async (arr, predicate) =>
  arr.reduce(async (memo, e) =>
      [...await memo, ...await predicate(e) ? [e] : []]
    , []);
