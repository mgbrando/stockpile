import { createError } from "apollo-errors";

const GraphqlError = (name, info) => createError(name, info);

export default GraphqlError;
